// State Aplikasi
let defaultTime = 60; 
let timeLeft = 60;
let timerInterval = null;
let isRunning = false;

let arrowsPerEnd = 3;
let currentShots = [];
let historyEnds = [];

// Inisialisasi Tampilan Rambahan Aktif
function initLiveRow() {
    const row = document.getElementById('liveShotsRow');
    row.innerHTML = '';
    for(let i=0; i<arrowsPerEnd; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'shot-bubble';
        bubble.innerText = currentShots[i] !== undefined ? currentShots[i] : '-';
        row.appendChild(bubble);
    }
}

// Timer Fungsi
function setTimer(seconds, element) {
    clearInterval(timerInterval);
    isRunning = false;
    document.getElementById('startBtn').innerText = 'Mulai';
    document.getElementById('startBtn').style.background = 'var(--success)';
    defaultTime = seconds;
    timeLeft = seconds;
    updateTimerDisplay();
    
    document.querySelectorAll('.timer-card .btn-time').forEach(b => b.classList.remove('active'));
    element.classList.add('active');
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('timerDisplay').innerText = `${mins}:${secs}`;
}

function toggleTimer() {
    const startBtn = document.getElementById('startBtn');
    if (isRunning) {
        clearInterval(timerInterval);
        startBtn.innerText = 'Mulai';
        startBtn.style.background = 'var(--success)';
        isRunning = false;
    } else {
        isRunning = true;
        startBtn.innerText = 'Jeda';
        startBtn.style.background = 'var(--danger)';
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                alert('Waktu Rambahan Habis!');
                resetTimer();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = defaultTime;
    updateTimerDisplay();
    const startBtn = document.getElementById('startBtn');
    startBtn.innerText = 'Mulai';
    startBtn.style.background = 'var(--success)';
}

// Fungsi Skoring
function setArrowPerEnd(num, element) {
    if(currentShots.length > 0) {
        if(!confirm('Mengubah jumlah anak panah akan meriset rambahan aktif saat ini. Lanjutkan?')) return;
    }
    arrowsPerEnd = num;
    currentShots = [];
    
    document.querySelectorAll('.arrow-settings .btn-time').forEach(b => b.classList.remove('active'));
    element.classList.add('active');
    
    initLiveRow();
    updateDashboard();
}

function inputScore(val) {
    if(currentShots.length < arrowsPerEnd) {
        currentShots.push(val);
        initLiveRow();
        calculateLiveSum();

        // Cek jika rambahan selesai
        if(currentShots.length === arrowsPerEnd) {
            setTimeout(() => {
                historyEnds.push([...currentShots]);
                currentShots = [];
                initLiveRow();
                updateDashboard();
                renderHistory();
                resetTimer(); // Reset timer otomatis ke rambahan berikutnya
            }, 400);
        }
    }
}

function calculateLiveSum() {
    let sum = 0;
    currentShots.forEach(s => {
        if(s === 'X' || s === 10) sum += 10;
        else if(s === 'M') sum += 0;
        else sum += parseInt(s);
    });
    document.getElementById('liveSum').innerText = sum;
}

function undoLastShot() {
    if(currentShots.length > 0) {
        currentShots.pop();
        initLiveRow();
        calculateLiveSum();
    } else if(historyEnds.length > 0) {
        if(confirm('Batalkan rambahan yang sudah selesai sebelumnya?')) {
            currentShots = historyEnds.pop();
            initLiveRow();
            calculateLiveSum();
            updateDashboard();
            renderHistory();
        }
    }
}

function updateDashboard() {
    let total = 0;
    let countX = 0;
    let count10 = 0;

    historyEnds.forEach(end => {
        end.forEach(shot => {
            if(shot === 'X') {
                total += 10;
                countX++;
            } else if(shot === 10) {
                total += 10;
                count10++;
            } else if(shot !== 'M') {
                total += parseInt(shot);
            }
        });
    });

    document.getElementById('totalScore').innerText = total;
    document.getElementById('currentEnd').innerText = historyEnds.length + 1;
    document.getElementById('totalX10').innerText = `${countX} / ${count10}`;
}

function renderHistory() {
    const tbody = document.getElementById('historyBody');
    if(historyEnds.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="color:#64748b;">Belum ada rambahan selesai</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    historyEnds.forEach((end, index) => {
        let endSum = 0;
        end.forEach(s => {
            if(s === 'X' || s === 10) endSum += 10;
            else if(s === 'M') endSum += 0;
            else endSum += parseInt(s);
        });

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td>${end.join(' - ')}</td>
            <td><strong>${endSum}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

function resetAllData() {
    if(confirm('Apakah Anda yakin ingin menghapus semua data skor dan mengulang dari awal?')) {
        currentShots = [];
        historyEnds = [];
        resetTimer();
        initLiveRow();
        updateDashboard();
        renderHistory();
        document.getElementById('liveSum').innerText = 0;
    }
}

// Jalankan pertama kali saat aplikasi dimuat
initLiveRow();
