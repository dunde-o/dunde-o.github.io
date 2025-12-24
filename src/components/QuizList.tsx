import { useState, useMemo } from "react";
import { Check, X, HelpCircle, ListChecks, ChevronUp, ChevronDown } from "lucide-react";

interface QuizItem {
  question: string;
  options?: string[];
  answer: number | string; // 객관식: 1-based number (1, 2, 3, 4), 주관식: string
  explanation?: string;
}

interface QuizListProps {
  items: QuizItem[];
}

// Fisher-Yates 셔플 알고리즘
const shuffleWithAnswer = (options: string[], answerIndex: number) => {
  const indices = options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffledOptions = indices.map((i) => options[i]);
  const shuffledAnswer = indices.indexOf(answerIndex);
  return { shuffledOptions, shuffledAnswer };
};

const QuizList = ({ items }: QuizListProps) => {
  const [answers, setAnswers] = useState<(number | string | null)[]>(
    items.map(() => null)
  );
  const [showResult, setShowResult] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 각 문제별 셔플된 옵션과 정답 (마운트 시 한 번만)
  // answer는 1-based 번호 (1, 2, 3, 4)
  const shuffledItems = useMemo(() => {
    return items.map((item) => {
      const isSubjective = !item.options || item.options.length === 0;
      if (isSubjective || typeof item.answer !== "number") {
        return { shuffledOptions: [], shuffledAnswer: 0, isSubjective: true };
      }
      // answer를 0-based index로 변환하여 셔플
      const { shuffledOptions, shuffledAnswer } = shuffleWithAnswer(
        item.options,
        item.answer - 1
      );
      return { shuffledOptions, shuffledAnswer, isSubjective: false };
    });
  }, []);

  const handleSelect = (itemIndex: number, optionIndex: number) => {
    if (showResult) return;
    const newAnswers = [...answers];
    newAnswers[itemIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleInputChange = (itemIndex: number, value: string) => {
    if (showResult) return;
    const newAnswers = [...answers];
    newAnswers[itemIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  // 채점 결과 계산
  const results = useMemo(() => {
    if (!showResult) return [];
    return items.map((item, index) => {
      const userAnswer = answers[index];
      const shuffled = shuffledItems[index];

      if (shuffled.isSubjective) {
        // 주관식
        const correctAnswer = String(item.answer).trim().toLowerCase();
        const userAnswerStr = String(userAnswer || "").trim().toLowerCase();
        return userAnswerStr === correctAnswer;
      } else {
        // 객관식
        return userAnswer === shuffled.shuffledAnswer;
      }
    });
  }, [showResult, answers, items, shuffledItems]);

  const correctCount = results.filter(Boolean).length;
  const totalCount = items.length;

  // 모든 문제에 답변했는지 확인
  const allAnswered = answers.every((answer) => {
    if (answer === null) return false;
    if (typeof answer === "string" && answer.trim() === "") return false;
    return true;
  });

  return (
    <div className="my-6 rounded-lg border border-primary/30 bg-primary/5 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
        <ListChecks className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary flex-1">
          Quiz ({totalCount}문제)
        </span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
        >
          {isCollapsed ? (
            <>
              열기 <ChevronDown className="w-4 h-4" />
            </>
          ) : (
            <>
              닫기 <ChevronUp className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isCollapsed ? "0fr" : "1fr" }}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-6">
        {items.map((item, itemIndex) => {
          const shuffled = shuffledItems[itemIndex];
          const userAnswer = answers[itemIndex];
          const isCorrect = showResult ? results[itemIndex] : null;

          return (
            <div
              key={itemIndex}
              className={`p-4 rounded-lg border ${
                showResult
                  ? isCorrect
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-red-500/30 bg-red-500/5"
                  : "border-border bg-card/30"
              }`}
            >
              {/* 문제 번호와 내용 */}
              <div className="flex gap-2 mb-3">
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                    showResult
                      ? isCorrect
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {itemIndex + 1}
                </span>
                <p className="text-foreground flex-1">{item.question}</p>
              </div>

              {/* 주관식 */}
              {shuffled.isSubjective ? (
                <div className="ml-8">
                  <input
                    type="text"
                    value={typeof userAnswer === "string" ? userAnswer : ""}
                    onChange={(e) =>
                      handleInputChange(itemIndex, e.target.value)
                    }
                    disabled={showResult}
                    placeholder="정답을 입력하세요"
                    className={`w-full px-3 py-2 rounded-md text-sm border text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50 ${
                      showResult
                        ? isCorrect
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-red-500/10 border-red-500/30"
                        : "bg-card/50 border-primary/20 focus:border-primary/50"
                    }`}
                  />
                  {showResult && !isCorrect && (
                    <p className="text-xs text-red-400 mt-1">
                      정답: {item.answer}
                    </p>
                  )}
                </div>
              ) : (
                /* 객관식 보기 */
                <div className="ml-8 space-y-2">
                  {shuffled.shuffledOptions.map((option, optIndex) => {
                    const isSelected = userAnswer === optIndex;
                    const isAnswerOption = optIndex === shuffled.shuffledAnswer;

                    let buttonClass =
                      "w-full px-3 py-2 rounded-md text-left text-sm transition-all flex items-center gap-2";

                    if (!showResult) {
                      buttonClass += isSelected
                        ? " bg-primary/20 text-primary border border-primary/50"
                        : " bg-card/50 hover:bg-primary/10 hover:text-primary cursor-pointer text-muted-foreground border border-transparent";
                    } else if (isAnswerOption) {
                      buttonClass +=
                        " bg-green-500/15 text-green-400 border border-green-500/30";
                    } else if (isSelected && !isAnswerOption) {
                      buttonClass +=
                        " bg-red-500/15 text-red-400 border border-red-500/30";
                    } else {
                      buttonClass +=
                        " bg-card/30 text-muted-foreground/50 border border-transparent";
                    }

                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleSelect(itemIndex, optIndex)}
                        disabled={showResult}
                        className={buttonClass}
                      >
                        <span className="w-5 h-5 rounded text-xs flex items-center justify-center flex-shrink-0 border border-current/30">
                          {optIndex + 1}
                        </span>
                        <span className="flex-1">{option}</span>
                        {showResult && isAnswerOption && (
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        )}
                        {showResult && isSelected && !isAnswerOption && (
                          <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 해설 */}
              {showResult && item.explanation && (
                <p className="ml-8 mt-2 text-xs text-muted-foreground">
                  💡 {item.explanation}
                </p>
              )}
            </div>
          );
        })}

        {/* 제출 버튼 또는 결과 */}
        <div className="pt-4 border-t border-primary/20">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="w-full px-4 py-3 rounded-lg text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              정답 확인하기
            </button>
          ) : (
            <div className="text-center">
              <p
                className={`text-lg font-medium ${
                  correctCount === totalCount
                    ? "text-green-400"
                    : correctCount >= totalCount / 2
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {totalCount}문제 중 {correctCount}문제 정답!
                {correctCount === totalCount && " 🎉"}
              </p>
            </div>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizList;
