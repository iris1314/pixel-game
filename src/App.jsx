import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import PixelButton from './components/PixelButton';
import { quizService } from './services/api';

const PASS_THRESHOLD = Number(import.meta.env.VITE_PASS_THRESHOLD) || 8;
const QUESTION_COUNT = Number(import.meta.env.VITE_QUESTION_COUNT) || 10;

function App() {
  const [gameState, setGameState] = useState('HOME'); // HOME, LOADING, QUIZ, RESULT
  const [userId, setUserId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [preloadedAvatars, setPreloadedAvatars] = useState([]);

  // Preload 100 DiceBear avatars
  useEffect(() => {
    const urls = Array.from({ length: 100 }, (_, i) => quizService.getDiceBearUrl(`boss-${i}`));
    setPreloadedAvatars(urls);
  }, []);

  const [showReview, setShowReview] = useState(false);

  const startGame = async () => {
    if (!userId.trim()) {
      alert('請輸入 ID 以開始遊戲！');
      return;
    }
    setGameState('LOADING');
    setShowReview(false); // Reset review state
    try {
      const data = await quizService.fetchQuestions(QUESTION_COUNT);
      setQuestions(data);
      setGameState('QUIZ');
    } catch (error) {
      alert('無法取得題目，請確認 GAS 設定是否正確');
      setGameState('HOME');
    }
  };

  const handleAnswer = (option) => {
    const newAnswers = [...answers, { id: questions[currentIndex].id, answer: option }];
    setAnswers(newAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setGameState('LOADING');
    try {
      const result = await quizService.submitAnswers(userId, finalAnswers, QUESTION_COUNT, PASS_THRESHOLD);
      
      const isPassed = result.passed !== undefined ? result.passed : (result.score >= PASS_THRESHOLD);
      
      const enrichedResult = {
        ...result,
        passed: isPassed
      };
      
      setFinalResult(enrichedResult);
      setGameState('RESULT');
      
      if (result.status === 'error') {
        console.error('GAS Error:', result.message);
      }
      
      if (isPassed) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error('Network/Submission Error:', error);
      alert('成績傳送失敗，請檢查網路連線或 GAS 權限');
      setGameState('HOME');
    }
  };

  if (gameState === 'LOADING') {
    return (
      <div className="pixel-border" style={{ textAlign: 'center' }}>
        <h2 className="blink">LOADING...</h2>
        <p>正在與伺服器連線</p>
      </div>
    );
  }

  if (gameState === 'HOME') {
    return (
      <div className="pixel-border" style={{ textAlign: 'center' }}>
        <h1>PIXEL QUIZ</h1>
        <p>挑戰像素關主，贏得勝利！</p>
        <div style={{ margin: '40px 0' }}>
          <input
            type="text"
            className="pixel-border"
            placeholder="ENTER YOUR ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ fontSize: '20px', width: '80%', background: '#fff', color: '#000' }}
          />
        </div>
        <PixelButton onClick={startGame}>INSERT COIN (START)</PixelButton>
      </div>
    );
  }

  if (gameState === 'QUIZ') {
    const currentQ = questions[currentIndex];
    const avatarUrl = preloadedAvatars[currentIndex % 100];

    return (
      <div className="pixel-border">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Lv.{currentIndex + 1}</span>
          <span>ID: {userId}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          <img src={avatarUrl} alt="Boss" style={{ width: '120px', height: '120px', border: '4px solid #fff' }} />
          <h3 style={{ margin: '20px 0', fontSize: '1.2rem', textAlign: 'center' }}>{currentQ.question}</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {['A', 'B', 'C', 'D'].map((opt) => (
            <PixelButton key={opt} onClick={() => handleAnswer(opt)} color="var(--pixel-bg)">
              {opt}: {currentQ.options[opt]}
            </PixelButton>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'RESULT') {
    const displayScore = Number(finalResult.score ?? 0);
    const totalQ = questions.length || QUESTION_COUNT;
    const currentThreshold = Number(PASS_THRESHOLD);
    const isActuallyPassed = displayScore >= currentThreshold;

    return (
      <div className="pixel-border" style={{ textAlign: 'center' }}>
        <h1>{isActuallyPassed ? 'VICTORY!' : 'GAME OVER'}</h1>
        
        {finalResult.status === 'error' && (
          <div style={{ color: 'var(--pixel-danger)', marginBottom: '10px', fontSize: '0.8rem' }}>
            [系統提示: 試算表寫入失敗，但您的成績為]
          </div>
        )}

        <p style={{ fontSize: '1.5rem', margin: '20px 0' }}>
          SCORE: {displayScore} / {totalQ}
        </p>
        
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: '20px 0', whiteSpace: 'pre-line' }}>
          {displayScore === 5 
            ? '你成功擊敗了所有像素關主！' 
            : (displayScore === 3 || displayScore === 4)
              ? `你很棒!答對了 ${displayScore} 題!`
              : isActuallyPassed 
                ? '恭喜過關！'
                : '別灰心，再挑戰一次吧！'}
        </p>
        
        {showReview && finalResult.correctAnswers && (
          <div style={{ textAlign: 'left', marginTop: '30px', maxHeight: '400px', overflowY: 'auto' }}>
            <h3 style={{ textAlign: 'center', borderBottom: '2px solid' }}>REVIEW</h3>
            {questions.map((q, idx) => {
              const uAns = answers.find(a => a.id === q.id)?.answer;
              const cAns = finalResult.correctAnswers[q.id];
              const isCorrect = uAns === cAns;
              return (
                <div key={q.id} className="pixel-border" style={{ marginBottom: '15px', padding: '10px', borderColor: isCorrect ? 'var(--pixel-secondary)' : 'var(--pixel-danger)' }}>
                  <p style={{ fontWeight: 'bold' }}>Q{idx + 1}: {q.question}</p>
                  <p style={{ fontSize: '0.9rem' }}>
                    你的選擇: <span style={{ color: isCorrect ? 'var(--pixel-secondary)' : 'var(--pixel-danger)' }}>{uAns}: {q.options[uAns]}</span>
                  </p>
                  {!isCorrect && (
                    <p style={{ fontSize: '0.9rem' }}>
                      正確答案: <span style={{ color: 'var(--pixel-secondary)' }}>{cAns}: {q.options[cAns]}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <PixelButton onClick={() => setShowReview(!showReview)} color="var(--pixel-primary)">
            {showReview ? 'CLOSE' : 'REVIEW'}
          </PixelButton>
          <PixelButton onClick={() => window.location.reload()}>CONTINUE</PixelButton>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
