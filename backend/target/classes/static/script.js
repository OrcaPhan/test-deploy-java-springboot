window.addEventListener('load', function() {
    // --- KHAI BÁO BIẾN & HẰNG SỐ ---
    // Luôn trỏ đến backend đang chạy trên cổng 8080
    const API_URL = 'http://localhost:8080/api/scores';

    // Game elements
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const gameUi = document.getElementById('game-ui');

    // UI elements
    const playerInfoModal = document.getElementById('playerInfoModal');
    const playerNameInput = document.getElementById('playerNameInput');
    const confirmPlayerButton = document.getElementById('confirmPlayerButton');
    const leaderboardList = document.getElementById('leaderboard-list');
    const leaderboardError = document.getElementById('leaderboard-error');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let score = 0;
    let gameTime = 30;
    let timerId;
    let gameActive = false;
    let birds = [];
    let animationFrameId;
    let currentPlayerName = '';

    // --- LỚP ĐỐI TƯỢNG "CHIM" (Không đổi) ---
    class Bird {
        constructor() {
            this.radius = Math.random() * 10 + 15;
            this.speedX = (Math.random() - 0.5) * 4 + 1;
            this.speedY = (Math.random() - 0.5) * 4;
            const edge = Math.floor(Math.random() * 4);
            if (edge === 0) { this.x = 0 - this.radius; this.y = Math.random() * canvas.height; }
            else if (edge === 1) { this.x = canvas.width + this.radius; this.y = Math.random() * canvas.height; this.speedX = -this.speedX; }
            else if (edge === 2) { this.x = Math.random() * canvas.width; this.y = 0 - this.radius; }
            else { this.x = Math.random() * canvas.width; this.y = canvas.height + this.radius; this.speedY = -Math.abs(this.speedY); }
            this.markedForDeletion = false;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 - this.radius || this.x > canvas.width + this.radius || this.y < 0 - this.radius || this.y > canvas.height + this.radius) {
                this.markedForDeletion = true;
            }
        }
        draw() {
            ctx.fillStyle = '#00a8ff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // --- HÀM XỬ LÝ API ---
    async function fetchLeaderboard() {
        leaderboardError.style.display = 'none'; // Ẩn thông báo lỗi trước khi fetch
        try {
            const response = await fetch(`${API_URL}/top`);
            if (!response.ok) throw new Error('Network response was not ok');
            const scores = await response.json();

            leaderboardList.innerHTML = '';
            if (scores.length === 0) {
                leaderboardList.innerHTML = '<li>Chưa có ai chơi. Hãy là người đầu tiên!</li>';
            } else {
                scores.forEach(score => {
                    const li = document.createElement('li');
                    li.textContent = `${score.playerName} - ${score.score} điểm`;
                    leaderboardList.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            leaderboardList.innerHTML = ''; // Xóa danh sách cũ (nếu có)
            leaderboardError.style.display = 'block'; // Hiển thị thông báo lỗi
        }
    }

    async function submitScore() {
        const scoreData = { playerName: currentPlayerName, score };
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scoreData)
            });
            if (!response.ok) throw new Error('Failed to submit score');
            
            // Cập nhật lại bảng xếp hạng sau khi gửi điểm
            fetchLeaderboard();
        } catch (error) {
            console.error('Error submitting score:', error);
            // Có thể thêm thông báo cho người dùng ở đây nếu cần
        }
    }

    // --- HÀM XỬ LÝ GAME ---
    function showPlayerInfoModal() {
        playerInfoModal.style.display = 'flex';
    }

    function startGame() {
        currentPlayerName = playerNameInput.value.trim() || 'Anonymous';
        playerInfoModal.style.display = 'none';

        score = 0;
        gameTime = 30;
        gameActive = true;
        birds = [];
        scoreElement.textContent = 'Score: 0';
        timerElement.textContent = `Time: ${gameTime}`;
        
        startButton.style.opacity = '0'; // Ẩn nút Start
        gameUi.style.opacity = '1'; // Hiện điểm và thời gian

        timerId = setInterval(() => {
            gameTime--;
            timerElement.textContent = `Time: ${gameTime}`;
            if (gameTime <= 0) {
                endGame();
            }
        }, 1000);

        animate(0);
    }

    function endGame() {
        gameActive = false;
        clearInterval(timerId);
        cancelAnimationFrame(animationFrameId);
        
        // Tự động gửi điểm
        submitScore();

        // Hiển thị thông báo kết thúc trên canvas
        ctx.fillStyle = 'white';
        ctx.font = '30px "Roboto Mono"';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);

        // Hiện lại nút Start để chơi lại
        startButton.style.opacity = '1';
        startButton.textContent = 'Play Again';
        gameUi.style.opacity = '0'; // Ẩn điểm và thời gian
    }

    canvas.addEventListener('click', function(event) {
        if (!gameActive) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        for (let i = birds.length - 1; i >= 0; i--) {
            const bird = birds[i];
            const distance = Math.sqrt(Math.pow(mouseX - bird.x, 2) + Math.pow(mouseY - bird.y, 2));
            if (distance < bird.radius) {
                bird.markedForDeletion = true;
                score++;
                scoreElement.textContent = `Score: ${score}`;
            }
        }
    });

    // --- VÒNG LẶP GAME ---
    let lastTime = 0;
    let birdTimer = 0;
    let birdInterval = 1000;

    function animate(timestamp) {
        if (!gameActive) return;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        birdTimer += deltaTime;
        if (birdTimer > birdInterval) {
            birds.push(new Bird());
            birdTimer = 0;
            if (birdInterval > 300) birdInterval *= 0.98;
        }

        birds.forEach(bird => {
            bird.update();
            bird.draw();
        });
        birds = birds.filter(bird => !bird.markedForDeletion);

        animationFrameId = requestAnimationFrame(animate);
    }

    // --- GÁN SỰ KIỆN & KHỞI TẠO ---
    startButton.addEventListener('click', showPlayerInfoModal);
    confirmPlayerButton.addEventListener('click', startGame);

    // Tải bảng xếp hạng ngay khi trang được mở
    fetchLeaderboard();
});