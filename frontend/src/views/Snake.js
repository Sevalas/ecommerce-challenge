import { useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";

const DIRECTIONS = { UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4 };
const FPS = 1000 / 15;

export default function Snake() {
  const gameCanvas = useRef(null);
  let ctx = undefined;
  let currentDirection = undefined;
  let newDirection = undefined;
  let food = undefined;
  let cicle = undefined;
  let score = undefined;
  let snake = undefined;

  useEffect(() => {
    if (gameCanvas && gameCanvas.current && ctx === undefined) {
      const canvas = gameCanvas.current;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ctx = canvas.getContext("2d");
      renderWalls(ctx);
      renderText(ctx, "¡Click or Press Enter to Start!", 300, 260, "30");
      renderText(ctx, "¡Click or Press Enter to Start!", 300, 260, "30");
      renderText(ctx, "Desktop: Move with ↑ ↓ → ← or W S D A", 300, 310, "30");
      renderText(ctx, "Mobile: Move with Tap or Swap", 300, 360, "30");
    }
    const eventHandler = (event) => {
      switch (event.code) {
        case "Enter":
          if (cicle === undefined) {
            startGame();
            return;
          }
          break;
        case "ArrowUp":
        case "KeyW":
          newDirection =
            // eslint-disable-next-line react-hooks/exhaustive-deps
            currentDirection !== DIRECTIONS.DOWN ? DIRECTIONS.UP : newDirection;
          break;
        case "ArrowRight":
        case "KeyD":
          newDirection =
            currentDirection !== DIRECTIONS.LEFT
              ? DIRECTIONS.RIGHT
              : newDirection;
          break;
        case "ArrowDown":
        case "KeyS":
          newDirection =
            currentDirection !== DIRECTIONS.UP ? DIRECTIONS.DOWN : newDirection;
          break;
        case "ArrowLeft":
        case "KeyA":
          newDirection =
            currentDirection !== DIRECTIONS.RIGHT
              ? DIRECTIONS.LEFT
              : newDirection;
          break;
        default:
          break;
      }
    };
    const eventHandler2 = () => {
      if (cicle === undefined) {
        startGame();
        return;
      }
      if (currentDirection === DIRECTIONS.DOWN) {
        newDirection = DIRECTIONS.LEFT;
      } else if (currentDirection === DIRECTIONS.LEFT) {
        newDirection = DIRECTIONS.UP;
      } else if (currentDirection === DIRECTIONS.UP) {
        newDirection = DIRECTIONS.RIGHT;
      } else if (currentDirection === DIRECTIONS.RIGHT) {
        newDirection = DIRECTIONS.DOWN;
      }
    };
    document.addEventListener("keydown", eventHandler);
    document.addEventListener("click", eventHandler2);
    return () => {
      document.addEventListener("keydown", eventHandler);
      document.removeEventListener("click", eventHandler2);
    };
  }, []);

  const fillUnit = (context, posX, posY) => {
    context.beginPath();
    context.fillStyle = "#2e490b";
    context.fillRect(posX, posY, 20, 20);
    context.stroke();
  };

  const renderSnake = (context, snake) => {
    for (let i = 0; i < snake.length; i++) {
      fillUnit(context, snake[i].posX, snake[i].posY);
    }
  };

  const renderFood = (context, food) => {
    fillUnit(context, food.posX, food.posY);
  };

  const renderWalls = (context) => {
    context.beginPath();
    context.lineWidth = "2";
    context.rect(20, 20, 560, 560);
    context.stroke();
  };

  const renderText = (context, texto, x, y, size) => {
    context.font = size + "px Arial";
    context.textAlign = "center";
    context.fillStyle = "black";
    context.fillText(texto, x, y);
  };

  const startGame = () => {
    if (gameCanvas && gameCanvas.current) {
      snake = [
        { posX: 60, posY: 20 },
        { posX: 40, posY: 20 },
        { posX: 20, posY: 20 },
      ];
      currentDirection = DIRECTIONS.RIGHT;
      newDirection = DIRECTIONS.RIGHT;
      generateNewFoodPosition(snake);
      score = 0;
      cicle = setInterval(gameCicle, FPS);
    }
  };

  const generateNewFoodPosition = (snake) => {
    while (true) {
      let XColumn = Math.max(Math.floor(Math.random() * 29), 1);
      let YColumn = Math.max(Math.floor(Math.random() * 29), 1);

      let posX = XColumn * 20;
      let posY = YColumn * 20;

      let snakeColition = false;
      for (let i = 0; i < snake.length; i++) {
        if (snake[i].posX === posX && snake[i].posY === posY) {
          snakeColition = true;
          break;
        }
      }

      if (snakeColition === true) {
        continue;
      }

      food = { posX: posX, posY: posY };
      break;
    }
  };

  function moveSnake(direction, snake) {
    let headPosX = snake[0].posX;
    let headPosY = snake[0].posY;

    if (direction === DIRECTIONS.RIGHT) {
      headPosX += 20;
    } else if (direction === DIRECTIONS.LEFT) {
      headPosX -= 20;
    } else if (direction === DIRECTIONS.DOWN) {
      headPosY += 20;
    } else if (direction === DIRECTIONS.UP) {
      headPosY -= 20;
    }

    // Add new head to the start of snake
    snake.unshift({ posX: headPosX, posY: headPosY });
    // Remove the tail of snake
    return snake.pop(); // { posX, posY }
  }

  function snakeAte(snake, food) {
    return snake[0].posX === food.posX && snake[0].posY === food.posY;
  }

  function increaseScore() {
    score++;
  }

  function snakeCollides(snake) {
    let head = snake[0];

    if (
      head.posX < 20 ||
      head.posY < 20 ||
      head.posX >= 580 ||
      head.posY >= 580
    ) {
      return true;
    }

    if (snake.length === 1) {
      return false;
    }

    for (let i = 1; i < snake.length; i++) {
      if (head.posX === snake[i].posX && head.posY === snake[i].posY) {
        return true;
      }
    }

    return false;
  }

  function gameOver() {
    clearInterval(cicle);
    cicle = undefined;
    renderText(ctx, "¡ Game Over :( !", 300, 260, "30");
    renderText(ctx, "Click or Enter to Play Again", 300, 310, "30");
    renderText(ctx, `SCORE: ${score}`, 300, 360, "30");
  }

  const gameCicle = () => {
    let discardedTail = moveSnake(newDirection, snake);
    currentDirection = newDirection;

    if (snakeAte(snake, food)) {
      snake.push(discardedTail);
      generateNewFoodPosition(snake);
      increaseScore();
    }

    if (snakeCollides(snake)) {
      gameOver();
      return;
    }

    ctx.clearRect(0, 0, 600, 600);
    renderText(ctx, `SCORE: ${score}`, 70, 40, "15");
    renderWalls(ctx);
    renderSnake(ctx, snake);
    renderFood(ctx, food);
  };

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      newDirection =
        currentDirection !== DIRECTIONS.DOWN ? DIRECTIONS.UP : newDirection;
    },
    onSwipedRight: () => {
      newDirection =
        currentDirection !== DIRECTIONS.LEFT ? DIRECTIONS.RIGHT : newDirection;
    },
    onSwipedDown: () => {
      newDirection =
        currentDirection !== DIRECTIONS.UP ? DIRECTIONS.DOWN : newDirection;
    },
    onSwipedLeft: () => {
      newDirection =
        currentDirection !== DIRECTIONS.RIGHT ? DIRECTIONS.LEFT : newDirection;
    },
  });
  return (
    <div {...swipeHandlers} className="text-center">
      <canvas ref={gameCanvas} id="gameCanvas" width="600" height="600" />
    </div>
  );
}
