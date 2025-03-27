import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const generateWordAndClues = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});
    
    // Prompt for word generation
    const wordPrompt = `Generate a single simple word, 
    along with 3 progressively revealing clues. 
    Format the response strictly as:
    Word: [WORD]
    Clue 1: [FIRST CLUE]
    Clue 2: [SECOND CLUE]
    Clue 3: [THIRD CLUE]`;

    const result = await model.generateContent(wordPrompt);
    const response = await result.response.text();

    // Parse the response
    const lines = response.split('\n');
    const word = lines[0].replace('Word: ', '').trim();
    const clues = [
      lines[1].replace('Clue 1: ', '').trim(),
      lines[2].replace('Clue 2: ', '').trim(),
      lines[3].replace('Clue 3: ', '').trim()
    ];

    return { word, clues };
  } catch (error) {
    console.error('Word generation failed', error);
    throw error;
  }
};

const PasswordGuessingGame = () => {
    const [currentGame, setCurrentGame] = useState(null);
    const [guess, setGuess] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [showClues, setShowClues] = useState(0);
    const [gameStatus, setGameStatus] = useState('start');
    const [isLoading, setIsLoading] = useState(false);
  
    const startNewGame = async () => {
      setIsLoading(true);
      setGameStatus('loading');
  
      try {
        const generatedWord = await generateWordAndClues();
        setCurrentGame(generatedWord);
        setGuess('');
        setAttempts(0);
        setShowClues(0);
        setGameStatus('playing');
      } catch (error) {
        console.error('Word generation failed', error);
        setGameStatus('error');
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleGuess = () => {
      if (!currentGame) return;
  
      setAttempts(prev => prev + 1);
  
      if (guess.toLowerCase() === currentGame.word.toLowerCase()) {
        setGameStatus('won');
      } else if (attempts >= 2) {
        setGameStatus('lost');
      }
    };
  
    const revealClue = () => {
      setShowClues(prev => Math.min(prev + 1, currentGame.clues.length));
    };
  
    useEffect(() => {
      startNewGame();
    }, []);
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-purple-800 flex items-center justify-center">
            Gemini Word Game
          </h1>
  
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full"></div>
              <p className="text-gray-600">Generating word and clues...</p>
            </div>
          ) : gameStatus === 'error' ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Generation Error
              </h2>
              <button 
                onClick={startNewGame} 
                className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
              >
                Retry
              </button>
            </div>
          ) : gameStatus === 'playing' ? (
            <>
              <div className="mb-4 text-center">
                <h2 className="text-xl font-semibold mb-2">Clues:</h2>
                {currentGame?.clues.slice(0, showClues).map((clue, index) => (
                  <div 
                    key={index} 
                    className="bg-blue-50 p-3 rounded-lg mb-2 flex items-center"
                  >
                    <p className="text-gray-700">{clue}</p>
                  </div>
                ))}
              </div>
  
              <div className="flex space-x-2 mb-4">
                <button 
                  onClick={revealClue} 
                  disabled={showClues >= currentGame?.clues.length}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Reveal Clue ({showClues}/{currentGame?.clues.length})
                </button>
              </div>
  
              <input 
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess"
                className="w-full p-2 border rounded mb-4"
              />
  
              <div className="flex space-x-2">
                <button 
                  onClick={handleGuess} 
                  className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 disabled:opacity-50"
                  disabled={gameStatus !== 'playing'}
                >
                  Guess
                </button>
              </div>
  
              <div className="text-center mt-4 text-gray-600">
                Attempts: {attempts}/3
              </div>
            </>
          ) : gameStatus === 'won' ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                Congratulations! 🎉
              </h2>
              <p className="mb-4">You guessed the word: {currentGame.word}</p>
              <button 
                onClick={startNewGame} 
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Game Over
              </h2>
              <p className="mb-4">
                The word was: {currentGame?.word}
              </p>
              <button 
                onClick={startNewGame} 
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
};

export default PasswordGuessingGame;