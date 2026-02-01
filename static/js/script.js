document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. CẤU HÌNH NGÀY THÁNG
    // ==========================================
    const startDate = new Date("2026-01-08"); 
    const tetDate = new Date("2026-02-17T00:00:00"); 

    function updateLoveCount() {
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        document.getElementById('days-count').innerText = diffDays;
    }
    updateLoveCount();

    function updateCountdown() {
        const now = new Date();
        const diff = tetDate - now;

        if (diff <= 0) {
            document.getElementById('countdown').innerText = "Chúc Mừng Năm Mới! 🎉";
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('countdown').innerText = `${days}d ${hours}h ${minutes}m`;
    }
    setInterval(updateCountdown, 60000);
    updateCountdown();

    // ==========================================
    // 2. LOGIC NHẠC NỀN (Chạy ngầm)
    // ==========================================
    const music = document.getElementById('bg-music');
    let playlist = [];
    let currentSongIndex = 0;

    // Lấy list nhạc
    fetch('/get-songs')
        .then(res => res.json())
        .then(songs => {
            if(songs.length > 0) {
                playlist = songs;
                playlist.sort(() => Math.random() - 0.5); // Shuffle
            }
        });

    function playNextSong() {
        if (playlist.length > 0) {
            currentSongIndex = (currentSongIndex + 1) % playlist.length;
            music.src = `/static/music/${playlist[currentSongIndex]}`;
            // iOS fix: play() phải được gọi sau khi user đã interact (đã có ở nút Start)
            music.play().catch(e => console.log("Auto-play blocked:", e));
        }
    }
    music.addEventListener('ended', playNextSong);

    // ==========================================
    // 3. INTRO & START (Xử lý iOS Audio Unlock)
    // ==========================================
    const startBtn = document.getElementById('start-btn');
    const introDiv = document.getElementById('intro');
    const mainContent = document.getElementById('main-content');

    // Typed.js
    new Typed('#typing-text', {
        strings: ["Hello Công Chúa...", "Tết đến rồi nè...", "Dương có quà cho Vy á ❤️"],
        typeSpeed: 50, backSpeed: 25, showCursor: false,
        onComplete: (self) => { document.getElementById('start-btn').classList.remove('hidden'); }
    });

    startBtn.addEventListener('click', () => {
        introDiv.style.opacity = 0;
        setTimeout(() => {
            introDiv.style.display = 'none';
            mainContent.classList.remove('hidden');
            
            // UNLOCK AUDIO ON iOS
            if (playlist.length > 0) {
                music.src = `/static/music/${playlist[0]}`;
                music.volume = 0.5;
                music.play().catch(e => console.log("Lỗi phát nhạc:", e));
            } else {
                music.play().catch(e => {}); // Thử play bài mặc định nếu playlist rỗng
            }
            
            initGame(); 
        }, 800);
    });

    // ==========================================
    // 4. GAME LOGIC (Tối ưu Touch & Visual)
    // ==========================================
    function initGame() {
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize chuẩn cho mobile (fix lỗi address bar)
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let items = []; 
        const flowerColors = ['#ff9a9e', '#ffc3a0', '#ffafbd', '#ffc3a0']; 

        class Item {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height - canvas.height;
                this.size = Math.random() * 10 + 6; // To hơn xíu cho dễ nhìn
                this.speed = Math.random() * 2 + 1;
                this.angle = Math.random() * 360;
                this.spin = Math.random() < 0.5 ? 0.8 : -0.8;
                this.type = Math.random() > 0.90 ? 'lixi' : 'flower'; 
                this.color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
                this.petalCount = 5;
            }

            update() {
                this.y += this.speed;
                this.angle += this.spin;
                this.x += Math.sin(this.angle * Math.PI / 180) * 0.8;
                if (this.y > canvas.height) {
                    this.y = -30;
                    this.x = Math.random() * canvas.width;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle * Math.PI / 180);

                if (this.type === 'flower') {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    for (let i = 0; i < this.petalCount; i++) {
                        ctx.rotate((Math.PI * 2) / this.petalCount);
                        ctx.moveTo(0, 0);
                        ctx.bezierCurveTo(this.size, -this.size/2, this.size, this.size/2, 0, 0);
                    }
                    ctx.fill();
                    ctx.fillStyle = '#ffeb3b';
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Vẽ Lì Xì
                    ctx.fillStyle = '#d32f2f'; 
                    ctx.fillRect(-14, -20, 28, 40);
                    ctx.fillStyle = '#ffd700'; 
                    ctx.beginPath();
                    ctx.arc(0, -10, 9, 0, Math.PI, false); 
                    ctx.fill();
                    ctx.fillStyle = '#ffff00';
                    ctx.font = "bold 14px Arial";
                    ctx.fillText("$", -4, 5);
                }
                ctx.restore();
            }
        }

        for (let i = 0; i < 55; i++) items.push(new Item());

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            items.forEach(item => { item.update(); item.draw(); });
            requestAnimationFrame(animate);
        }
        animate();

        // --- XỬ LÝ INPUT (Hỗ trợ cả Mouse và Touch) ---
        function handleInput(e) {
            // Ngăn sự kiện mặc định nếu cần (nhưng để scroll thì ko prevent)
            // e.preventDefault(); 
            
            let clientX, clientY;
            if (e.type === 'touchstart') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            // 1. Tạo hiệu ứng Visual (Ripple)
            createRipple(clientX, clientY);

            // 2. Check va chạm (Hitbox rộng hơn cho mobile)
            const rect = canvas.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            items.forEach((item) => {
                if (item.type === 'lixi') {
                    // Tăng hitbox lên 50px cho dễ bấm
                    const dist = Math.hypot(x - item.x, y - item.y);
                    if (dist < 50) { 
                        item.y = -50; 
                        item.x = Math.random() * canvas.width;
                        showGift();
                    }
                }
            });
        }

        // Add Listeners
        canvas.addEventListener('mousedown', handleInput);
        canvas.addEventListener('touchstart', handleInput, {passive: false}); // passive: false để fix lỗi trên iOS mới
    }

    // Hiệu ứng Visual Feedback (Ripple)
    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.classList.add('click-effect');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        document.body.appendChild(ripple);
        // Tự xóa sau khi chạy xong animation
        setTimeout(() => ripple.remove(), 400);
    }

    // Hiển thị quà
    function showGift() {
        fetch('/get-wish')
            .then(res => res.json())
            .then(data => {
                let randomImg = Math.floor(Math.random() * 5) + 1;
                Swal.fire({
                    title: "Bắt dính rồi! 🧧",
                    html: `<div style="font-size:1.1rem; color:#333;">${data.msg}</div><br><div style="color:#e91e63; font-weight:bold;">${data.voucher}</div>`,
                    imageUrl: `/static/images/ny_${randomImg}.jpg`,
                    imageWidth: 250,
                    confirmButtonText: 'Moahzz ❤️',
                    confirmButtonColor: '#ff6b81'
                });
            });
    }

    // ==========================================
    // 5. NÚT CHỨC NĂNG KHÁC
    // ==========================================
    document.getElementById('secret-btn').addEventListener('click', () => {
        const secrets = [
            { type: 'image', src: '/static/images/secret_1.jpg', msg: 'Chụp lén nè hihi 🤣' },
            { type: 'image', src: '/static/images/secret_2.jpg', msg: 'Tấm này cute xỉu!' },
            { type: 'video', src: '/static/videos/secret.mp4', msg: 'Video quay lén độc quyền 🎥' }
        ];
        const randomSecret = secrets[Math.floor(Math.random() * secrets.length)];

        let swalOptions = {
            title: randomSecret.msg,
            text: 'Dù bị chụp lén nhưng mà... công nhận đẹp đôi! Iu vợ.',
            confirmButtonText: 'Moahzz ❤️',
            confirmButtonColor: '#ff6b81',
            backdrop: `rgba(0,0,0,0.6)`
        };

        if (randomSecret.type === 'image') {
            swalOptions.imageUrl = randomSecret.src;
            swalOptions.imageWidth = 400;
        } else {
            swalOptions.html = `
                <video width="100%" controls autoplay playsinline style="border-radius: 10px;">
                    <source src="${randomSecret.src}" type="video/mp4">
                </video>`;
        }
        Swal.fire(swalOptions);
    });

    // Thư
    const modal = document.getElementById('letter-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    document.getElementById('letter-btn').addEventListener('click', () => {
        const letterContent = `
            Gửi <b>"Boss tiêu tiền của phản diện"</b> (aka Vy Nấm lùn),<br><br>
            Hello "Chị đẹp", lại là chàng hoàng tử đang ngồi bấm máy tính của em đây =)))<br>
            Tết 2026 đến rùi ó. Cảm ơn bé vì năm qua đã chịu đựng cái sự "vô tri" của tui. 
            Tuy tui hay chọc ghẹo, hay làm bà quạo, nhưng mà tui thương bà lắm ó.<br><br>
            Năm mới chúc vợ iu bớt ghét môn Lý lại (gáng lên!), học giỏi khối A để sau này còn nuôi tui nữa chứ.
            Dù bà có đanh đá hay "tâm cơ" cỡ nào thì tui vẫn sẽ ở đây để "rước nàng về dinh" (nếu nàng không chê tui nghèo kkk).<br><br>
            Mãi iu nhee công chúa của tui ❤️<br>
            <i>(Ký tên: Phản diện đẹp trai)</i>
        `;
        document.getElementById('letter-text').innerHTML = letterContent;
        modal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => { modal.classList.add('hidden'); });
    // Click ngoài modal để đóng
    window.addEventListener('click', (e) => { if (e.target == modal) modal.classList.add('hidden'); });
});