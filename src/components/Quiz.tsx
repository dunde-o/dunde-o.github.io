import { useState, useMemo } from "react";
import { Check, X, HelpCircle, ChevronUp, ChevronDown } from "lucide-react";

interface QuizProps {
  question: string;
  options?: string[];
  answer: number | string; // 객관식: 1-based number (1, 2, 3, 4), 주관식: string
  explanation?: string;
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

const Quiz = ({ question, options, answer, explanation }: QuizProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 주관식 여부 판단
  const isSubjective = !options || options.length === 0;

  // 객관식: 옵션 셔플 (컴포넌트 마운트 시 한 번만)
  // answer는 1-based 번호 (1, 2, 3, 4)
  const { shuffledOptions, shuffledAnswer } = useMemo(() => {
    if (isSubjective || typeof answer !== "number") {
      return { shuffledOptions: [], shuffledAnswer: 0 };
    }
    // answer를 0-based index로 변환하여 셔플
    return shuffleWithAnswer(options, answer - 1);
  }, []);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
  };

  const handleSubjectiveSubmit = () => {
    if (showResult || !userInput.trim()) return;
    setShowResult(true);
  };

  // 주관식 정답 체크 (대소문자 무시, 앞뒤 공백 제거, 숫자도 문자열로 비교)
  const isSubjectiveCorrect =
    isSubjective &&
    userInput.trim().toLowerCase() === String(answer).trim().toLowerCase();

  const isCorrect = isSubjective ? isSubjectiveCorrect : selected === shuffledAnswer;

  return (
    <div className="my-6 rounded-lg border border-primary/30 bg-primary/5 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary flex-1">Quiz</span>
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
          <div className="p-4">
        {/* 문제 */}
        <p className="text-foreground mb-4">{question}</p>

        {/* 주관식 */}
        {isSubjective ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubjectiveSubmit()}
                disabled={showResult}
                placeholder="정답을 입력하세요"
                className="flex-1 px-3 py-2 rounded-md text-sm bg-card/50 border border-primary/20 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 disabled:opacity-50"
              />
              <button
                onClick={handleSubjectiveSubmit}
                disabled={showResult || !userInput.trim()}
                className="px-4 py-2 rounded-md text-sm bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                확인
              </button>
            </div>
          </div>
        ) : (
          /* 객관식 보기 */
          <div className="space-y-2">
            {shuffledOptions.map((option, index) => {
              const isSelected = selected === index;
              const isAnswerOption = index === shuffledAnswer;

              let buttonClass =
                "w-full px-3 py-2 rounded-md text-left text-sm transition-all flex items-center gap-2";

              if (!showResult) {
                buttonClass +=
                  " bg-card/50 hover:bg-primary/10 hover:text-primary cursor-pointer text-muted-foreground";
              } else if (isAnswerOption) {
                buttonClass += " bg-green-500/15 text-green-400";
              } else if (isSelected && !isAnswerOption) {
                buttonClass += " bg-red-500/15 text-red-400";
              } else {
                buttonClass += " bg-card/30 text-muted-foreground/50";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <span className="w-5 h-5 rounded text-xs flex items-center justify-center flex-shrink-0 border border-current/30">
                    {index + 1}
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

        {/* 결과 */}
        {showResult && (
          <div className="mt-3 pt-3 border-t border-primary/20">
            <p className={`text-sm ${isCorrect ? "text-green-400" : "text-red-400"}`}>
              {isCorrect
                ? "정답!"
                : isSubjective
                ? `오답. 정답: ${answer}`
                : `오답. 정답: ${shuffledAnswer + 1}번`}
              {explanation && (
                <span className="text-muted-foreground ml-2">- {explanation}</span>
              )}
            </p>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
