
document.addEventListener('DOMContentLoaded', () => {

	//canvas board
	let board;
	let boardWidth = 800;
	let boardHeight = 700;
	let context;

	//paddles
	let paddleWidth = 120;
	let paddleHeight = 15;
	let paddleSpeedX = 10;

	let paddle = {
		x: boardWidth / 2 - paddleWidth / 2,
		y: boardHeight - paddleHeight - 5,
		width: paddleWidth,
		height: paddleHeight,
		speedX: paddleSpeedX
	}

	//ball
	let ballWidth = 10;
	let ballHeight = 10;
	let ballspeedX = 3;
	let ballspeedY = 2;

	let ball = {
		radius: 10,
		x: boardWidth / 2,
		y: boardHeight / 2,
		width: ballWidth,
		height: ballHeight,
		speedX: ballspeedX,
		speedY: ballspeedY
	}

	//rects
	let rectArray = [];
	let rectWidth = 60;
	let rectHeight = 15;
	let rectColumns = 8;
	let rectRows = 6;
	let rectMaxRows = 20;
	let rectCount = 0;

	//postion de début des paddles à partir du bord gauche 
	let rectX = 100;
	let rectY = 60;

	let score = 0;
	let stopGame = 0;
	let gameOver = false;
	let animation;

	function playGame() {
		board = document.getElementById("board");
		board.height = boardHeight;
		board.width = boardWidth;
		//code permettant de pouvoir dessiné dans le canvas 2D
		context = board.getContext("2d");

		//paddle initial
		context.fillStyle = "#ffff";
		context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

		animation = requestAnimationFrame(update);
		document.addEventListener("keydown", initGame);

		//create rects
		createRects();
	}

	playGame();

	function update() {
		animation = requestAnimationFrame(update);
		//restart
		if (gameOver) {
			return;
		}
		context.clearRect(0, 0, board.width, board.height);

		// paddle
		context.fillStyle = "white";
		context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

		ball.x += ball.speedX;
		ball.y += ball.speedY;
		context.beginPath();
		context.fillStyle = "#ffff";
		context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
		context.fill();
		context.closePath();


		if (topCollision(ball, paddle) || bottomCollision(ball, paddle)) {
			ball.speedY *= -1;
		}
		else if (leftCollision(ball, paddle) || rightCollision(ball, paddle)) {
			ball.speedX *= -1;
		}

		if (ball.y <= 0) {

			ball.speedY *= -1;
		}
		else if (ball.x <= 0 || (ball.x + ball.width >= boardWidth)) {

			ball.speedX *= -1;
		}
		else if (ball.y + ball.height >= boardHeight) {

			context.font = "2rem Impact";
			context.fillStyle = "coral";
			context.fillText("GAME OVER: \n Tap Space and Continue", 150, 350);
			gameOver = true;
		}

		//rects
		context.fillStyle = "#fffff";
		for (let i = 0; i < rectArray.length; i++) {
			let rect = rectArray[i];
			if (!rect.break) {
				if (topCollision(ball, rect) || bottomCollision(ball, rect)) {
					rect.break = true;     // rectangles cassés
					ball.speedY *= -1;   // x direction top or bottom
					score += 5;
					rectCount -= 1;
				}
				else if (leftCollision(ball, rect) || rightCollision(ball, rect)) {
					rect.break = true;     // rectangle cassés
					ball.speedX *= -1;   // x direction left or right
					score += 5;
					rectCount -= 1;
				}
				context.fillRect(rect.x, rect.y, rect.width, rect.height);
			}
		}

		//next level
		if (rectCount == 0) {
			score += 5 * rectRows * rectColumns; //bonus points :)
			rectRows = Math.min(rectRows + 1, rectMaxRows);
			createRects();
		}

		//score
		context.font = "1.5rem Impact";
		context.fillText("Score: " + score, 40, 40);
	}

	function outOfBall(xPosition) {
		return (
			xPosition < 0 ||
			(xPosition + paddleWidth) > boardWidth);
	}

	function initGame(events) {
		let nextpaddleX;
		switch (events.key) {

			case "ArrowRight":
				if (!outOfBall(nextpaddleX = paddle.x + paddle.speedX)) {
					paddle.x = nextpaddleX;
				}
				break;

			case "ArrowLeft":
				if (!outOfBall(nextpaddleX = paddle.x - paddle.speedX)) {
					paddle.x = nextpaddleX;
				}
				break;
			case " ":
				if (gameOver) {
					playGame();
					resetGame();
				}
				else if (!gameOver) {
					return;
				}
				break;
			default:
				break;

		}
	}

/*
stopGame++;
else if ((stopGame % 2 || (stopGame % 2) === 0) === 1) {
    pauseGame();
    cancelAnimationFrame(animation);
}
*/

	function detectCollision(positionX, positionY) {

		return positionX.x < positionY.x + positionY.width &&

			positionX.x + positionX.width > positionY.x &&

			positionX.y < positionY.y + positionY.height &&

			positionX.y + positionX.height > positionY.y;
	}

	function topCollision(ball, rect) { //a is above b (ball is above rect)
		return detectCollision(ball, rect) && (ball.y + ball.height) >= rect.y;
	}

	function bottomCollision(ball, rect) {
		return detectCollision(ball, rect) && (rect.y + rect.height) >= ball.y;
	}

	function leftCollision(ball, rect) {
		return detectCollision(ball, rect) && (ball.x + ball.width) >= rect.x;
	}

	function rightCollision(ball, rect) {
		return detectCollision(ball, rect) && (rect.x + rect.width) >= ball.x;
	}

	function createRects() {
		//suppression des tableau de rectangle
		rectArray = [];
		for (let c = 0; c < rectColumns; c++) {
			for (let r = 0; r < rectRows; r++) {
				let rect = {
					//c*10 espace 10 pixels entre les columns
					x: rectX + c * rectWidth + c * 20,
					//r*10 espace 10 pixels entre les rows
					y: rectY + r * rectHeight + r * 10,
					width: rectWidth,
					height: rectHeight,
					break: false
				}
				rectArray.push(rect);
			}
		}
		rectCount = rectArray.length;
	}

	function resetGame() {
		gameOver = false;

		paddle = {
			x: boardWidth / 2 - paddleWidth / 2,
			y: boardHeight - paddleHeight - 5,
			width: paddleWidth,
			height: paddleHeight,
			speedX: paddleSpeedX
		}
		ball = {
			x: boardWidth / 2,
			y: boardHeight / 2,
			width: ballWidth,
			radius: 10,
			height: ballHeight,
			speedX: ballspeedX,
			speedY: ballspeedY
		}

		rectArray = [];
		rectRows = 6;
		score = 0;
		createRects();
	}

	function pauseGame() {
		if ((ball.y + ball.radius) >= boardHeight) {
			context.font = "2rem Impact";
			context.fillStyle = "green";
			context.fillText("Game Pause", 100, 250);
			cancelAnimationFrame(animation)
		}
	}

});