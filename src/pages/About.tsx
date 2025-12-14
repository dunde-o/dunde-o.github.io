import { useEffect } from "react";
import Navbar from "@/components/Navbar";

const About = () => {
  useEffect(() => {
    document.title = "Dunde's Portfolio | About";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-[hsl(var(--hero-gradient-to))] bg-clip-text text-transparent">
            About Me
          </h1>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed text-lg break-keep">
            <p>
              저는 사용자와 가장 가까운 곳에서 소통하는 프론트엔드 개발을 기반으로 성장해 왔습니다. 하지만 제 영역을 단순히 '화면을 그리는 일'에만 한정 짓지는 않습니다. 기술의 경계를 두지 않고 스펀지처럼 흡수하는 것을 즐기며, 웹 기술을 넘어 서비스에 필요한 다양한 도구를 유연하게 습득하고 활용하는 데 가치를 둡니다.
            </p>
            
            <p>
              최근에는 다져온 프론트엔드 역량 위에 생성형 AI와 LLM 기술을 더하는 것에 깊이 몰입하고 있습니다. 단순히 AI 모델을 연구하는 것을 넘어, 이 기술이 실제 사용자의 인터페이스와 만났을 때 어떤 혁신적인 경험을 줄 수 있을지 고민합니다. 기존의 개발 기술과 최신 AI 기술을 결합하여, 전에 없던 새로운 가치를 창출하는 것이 저의 현재 목표입니다.
            </p>
            
            <p>
              이곳은 그러한 아이디어를 구체화하기 위해 끊임없이 시도하고 실험한 기록들의 저장소입니다. 상상 속에만 있던 AI 기반의 아이디어를 실제 작동하는 웹 서비스로 구현해 보며, 오늘도 저는 기술과 기술 사이를 잇는 다양한 시도들을 이어가고 있습니다.
            </p>
            
            <div className="pt-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4 break-keep">
                Skills & Expertise
              </h2>
              <p>
                React 기반의 프론트엔드 역량 위에 생성형 AI를 엔진 삼아 개발 생산성을 극대화했습니다. AI와의 긴밀한 협업으로 언어의 장벽을 넘어 Flutter와 Python 프로젝트를 자유롭게 병행하며, 아이디어를 즉시 실제 서비스로 구현하는 실행력을 갖추고 있습니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
