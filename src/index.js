import React, { useState } from "react";
import ReactDOM from "react-dom";
import { colors, numStatus, utils } from "./utils";

import "./styles.css";

const StarsDisplay = props => (
  // using something in React Fragment
  <>
    {utils.range(1, props.count).map(starId => (
      <div key={starId} className="star" />
    ))}
  </>
);

const PlayNumber = props => (
  <button
    className="number"
    style={{ background: colors[props.status] }}
    onClick={() => props.onClick(props.number, props.status)}
  >
    {props.number}
  </button>
);

const PlayAgain = props => (
  <div className="game-done">
    <div
      className="message"
      style={{ color: props.status === gameStatus.lost ? "red" : "green" }}
    >
      {props.status === gameStatus.lost ? "Game Over" : "Nice"}
    </div>
    <button onClick={props.onClick}>Play Again</button>
  </div>
);

const gameStatus = {
  won: "won",
  lost: "lost",
  active: "active"
};

// custom hook
const useGameState = () => {
  // use react hooks to get state variable
  const [stars, setStars] = useState(utils.random(1, 9));
  const [availableNums, setAvailableNums] = useState(utils.range(1, 9));
  const [candidateNums, setCandidateNums] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(10);

  React.useEffect(() => {
    if (secondsLeft > 0 && availableNums.length > 0) {
      const timerId = setTimeout(() => {
        setSecondsLeft(secondsLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  });

  const setGameState = newCandidateNums => {
    if (utils.sum(newCandidateNums) !== stars) {
      setCandidateNums(newCandidateNums);
    } else {
      const newAvailableNums = availableNums.filter(
        n => !newCandidateNums.includes(n)
      );
      setStars(utils.randomSumIn(newAvailableNums, 9));
      setAvailableNums(newAvailableNums);
      setCandidateNums([]);
    }
  };

  return { stars, availableNums, candidateNums, secondsLeft, setGameState };
};

const Game = props => {
  const {
    stars,
    availableNums,
    candidateNums,
    secondsLeft,
    setGameState
  } = useGameState();

  const areCandidatesCorrect = () => {
    return utils.sum(candidateNums) <= stars;
  };

  const currentGameStatus =
    availableNums.length === 0
      ? gameStatus.won
      : secondsLeft === 0
      ? gameStatus.lost
      : gameStatus.active;

  // const resetGame = () => {
  //   setStars(utils.random(1, 9));
  //   setAvailableNums(utils.range(1, 9));
  //   setCandidateNums([]);
  // };

  const getNumberStatus = number => {
    if (!availableNums.includes(number)) {
      return numStatus.used;
    }
    if (candidateNums.includes(number)) {
      return areCandidatesCorrect() ? numStatus.candidate : numStatus.wrong;
    }
    return numStatus.available;
  };

  const onNumClick = (number, currentStatus) => {
    // currentStatus => newStatus
    if (
      currentGameStatus !== gameStatus.active ||
      currentStatus === numStatus.used
    ) {
      return;
    }

    const newCandidateNums =
      currentStatus === numStatus.available
        ? candidateNums.concat(number)
        : candidateNums.filter(n => n !== number);

    setGameState(newCandidateNums);
  };

  return (
    <div className="game">
      <div className="help">
        Pick 1 or more numbers that sum to the number of stars
      </div>
      <div className="body">
        <div className="left">
          {currentGameStatus !== gameStatus.active ? (
            <PlayAgain
              onClick={props.startNewGame}
              status={currentGameStatus}
            />
          ) : (
            <StarsDisplay count={stars} />
          )}
        </div>
        <div className="right">
          {utils.range(1, 9).map(number => (
            <PlayNumber
              key={number}
              number={number}
              status={getNumberStatus(number)}
              onClick={onNumClick}
            />
          ))}
        </div>
      </div>
      <div className="timer">Time Remaining: {secondsLeft}</div>
    </div>
  );
};

const StarMatch = () => {
  const [gameId, setGameId] = useState(1);
  return <Game key={gameId} startNewGame={() => setGameId(gameId + 1)} />;
};

const rootElement = document.getElementById("root");
ReactDOM.render(<StarMatch />, rootElement);
