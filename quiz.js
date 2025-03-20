(function() {
  // グローバル変数
  let playbackSpeed = 1.0;
  // selectedUnit は既存単元（例："2022_第1回", "2023_第1回", …, "2024_第4回"）または新規単元（例："共テ2025年度_1A", "共テ2025年度_1B", "共テ2025年度_2", "共テ2025年度_3"）
  let selectedUnit = null;
  let currentQuestions = [];
  // 既存単元は selectedSet（問1, 問2）があるが、新規単元はそのまま回答順で管理
  let selectedSet = null;
  let currentQuestionIndex = 0;
  let results = [];
  let currentPlayCount = 0;
  let answerSubmitted = false;
  let metadataLoaded = false;

  // グローバルな audio 要素
  const audioPlayer = document.getElementById('audioPlayer');

  // 速度UI更新関数
  function updateSpeedUI() {
    const knob = document.getElementById('speedKnob');
    const label = document.getElementById('speedLabel');
    const container = document.getElementById('speedBarContainer');
    if (knob && container && label) {
      const percent = ((playbackSpeed - 0.5) / 1.0) * 100;
      knob.style.left = percent + "%";
      label.textContent = playbackSpeed.toFixed(1) + "倍";
      const slowBtn = document.getElementById('slowDownButton');
      const fastBtn = document.getElementById('speedUpButton');
      if (slowBtn && fastBtn) {
        slowBtn.disabled = (playbackSpeed <= 0.5);
        fastBtn.disabled = (playbackSpeed >= 1.5);
        slowBtn.style.opacity = (playbackSpeed <= 0.5) ? 0.5 : 1;
        fastBtn.style.opacity = (playbackSpeed >= 1.5) ? 0.5 : 1;
      }
    }
  }

  // 速度ノブのドラッグ操作
  const speedBarContainer = document.getElementById('speedBarContainer');
  const speedKnob = document.getElementById('speedKnob');
  function onSpeedKnobDrag(event) {
    event.preventDefault();
    let clientX = event.clientX;
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
    }
    const rect = speedBarContainer.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;
    playbackSpeed = 0.5 + (offsetX / rect.width) * 1.0;
    audioPlayer.playbackRate = playbackSpeed;
    updateSpeedUI();
  }
  speedKnob.addEventListener('mousedown', function(event) {
    document.addEventListener('mousemove', onSpeedKnobDrag);
    document.addEventListener('mouseup', function mouseUpHandler(e) {
      document.removeEventListener('mousemove', onSpeedKnobDrag);
      document.removeEventListener('mouseup', mouseUpHandler);
    });
  });
  speedKnob.addEventListener('touchstart', function(event) {
    document.addEventListener('touchmove', onSpeedKnobDrag);
    document.addEventListener('touchend', function touchEndHandler(e) {
      document.removeEventListener('touchmove', onSpeedKnobDrag);
      document.removeEventListener('touchend', touchEndHandler);
    });
  });
  updateSpeedUI();

  // シーン切り替え
  function showScene(sceneId) {
    document.querySelectorAll('.scene').forEach(scene => {
      scene.style.display = 'none';
    });
    const target = document.getElementById(sceneId);
    if (target) {
      target.style.display = 'block';
    } else {
      console.error("Scene " + sceneId + " not found!");
    }
  }

  // 進行状況バー更新
  function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (audioPlayer && audioPlayer.duration) {
      const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.style.width = percentage + '%';
    }
  }

  // ----- 各単元の問題データ（既存単元の定義はこれまで通り） -----
  // 2022_第1回
  const unit0Set1Questions = [
    { id: "2022_第1回_1_1", picture: "./VPA/2022_第1回_1_1picture.png", voice: "./VPA/2022_第1回_1_1voice.mp3", script: "./VPA/2022_第1回_1_1script.txt" },
    { id: "2022_第1回_1_2", picture: "./VPA/2022_第1回_1_2picture.png", voice: "./VPA/2022_第1回_1_2voice.mp3", script: "./VPA/2022_第1回_1_2script.txt" },
    { id: "2022_第1回_1_3", picture: "./VPA/2022_第1回_1_3picture.png", voice: "./VPA/2022_第1回_1_3voice.mp3", script: "./VPA/2022_第1回_1_3script.txt" },
    { id: "2022_第1回_1_4", picture: "./VPA/2022_第1回_1_4picture.png", voice: "./VPA/2022_第1回_1_4voice.mp3", script: "./VPA/2022_第1回_1_4script.txt" }
  ];
  const unit0Set2Questions = [
    { id: "2022_第1回_2_1", picture: "./VPA/2022_第1回_2_1picture.png", voice: "./VPA/2022_第1回_2_1voice.mp3", script: "./VPA/2022_第1回_2_1script.txt" },
    { id: "2022_第1回_2_2", picture: "./VPA/2022_第1回_2_2picture.png", voice: "./VPA/2022_第1回_2_2voice.mp3", script: "./VPA/2022_第1回_2_2script.txt" },
    { id: "2022_第1回_2_3", picture: "./VPA/2022_第1回_2_3picture.png", voice: "./VPA/2022_第1回_2_3voice.mp3", script: "./VPA/2022_第1回_2_3script.txt" }
  ];

  // 2022_第3回
  const unit9Set1Questions = [
    { id: "2022_第3回_1_1", picture: "./VPA/2022_第3回_1_1picture.png", voice: "./VPA/2022_第3回_1_1voice.mp3", script: "./VPA/2022_第3回_1_1script.txt" },
    { id: "2022_第3回_1_2", picture: "./VPA/2022_第3回_1_2picture.png", voice: "./VPA/2022_第3回_1_2voice.mp3", script: "./VPA/2022_第3回_1_2script.txt" },
    { id: "2022_第3回_1_3", picture: "./VPA/2022_第3回_1_3picture.png", voice: "./VPA/2022_第3回_1_3voice.mp3", script: "./VPA/2022_第3回_1_3script.txt" }
  ];
  const unit9Set2Questions = [
    { id: "2022_第3回_2_1", picture: "./VPA/2022_第3回_2_1picture.png", voice: "./VPA/2022_第3回_2_1voice.mp3", script: "./VPA/2022_第3回_2_1script.txt" },
    { id: "2022_第3回_2_2", picture: "./VPA/2022_第3回_2_2picture.png", voice: "./VPA/2022_第3回_2_2voice.mp3", script: "./VPA/2022_第3回_2_2script.txt" },
    { id: "2022_第3回_2_3", picture: "./VPA/2022_第3回_2_3picture.png", voice: "./VPA/2022_第3回_2_3voice.mp3", script: "./VPA/2022_第3回_2_3script.txt" },
    { id: "2022_第3回_2_4", picture: "./VPA/2022_第3回_2_4picture.png", voice: "./VPA/2022_第3回_2_4voice.mp3", script: "./VPA/2022_第3回_2_4script.txt" }
  ];

  // 2023_第1回
  const unit1Set1Questions = [
    { id: "2023_第1回_1_1", picture: "./VPA/2023_第1回_1_1picture.png", voice: "./VPA/2023_第1回_1_1voice.mp3", script: "./VPA/2023_第1回_1_1script.txt" },
    { id: "2023_第1回_1_2", picture: "./VPA/2023_第1回_1_2picture.png", voice: "./VPA/2023_第1回_1_2voice.mp3", script: "./VPA/2023_第1回_1_2script.txt" },
    { id: "2023_第1回_1_3", picture: "./VPA/2023_第1回_1_3picture.png", voice: "./VPA/2023_第1回_1_3voice.mp3", script: "./VPA/2023_第1回_1_3script.txt" }
  ];
  const unit1Set2Questions = [
    { id: "2023_第1回_2_1", picture: "./VPA/2023_第1回_2_1picture.png", voice: "./VPA/2023_第1回_2_1voice.mp3", script: "./VPA/2023_第1回_2_1script.txt" },
    { id: "2023_第1回_2_2", picture: "./VPA/2023_第1回_2_2picture.png", voice: "./VPA/2023_第1回_2_2voice.mp3", script: "./VPA/2023_第1回_2_2script.txt" },
    { id: "2023_第1回_2_3", picture: "./VPA/2023_第1回_2_3picture.png", voice: "./VPA/2023_第1回_2_3voice.mp3", script: "./VPA/2023_第1回_2_3script.txt" },
    { id: "2023_第1回_2_4", picture: "./VPA/2023_第1回_2_4picture.png", voice: "./VPA/2023_第1回_2_4voice.mp3", script: "./VPA/2023_第1回_2_4script.txt" }
  ];

  // 2023_第2回
  const unit2Set1Questions = [
    { id: "2023_第2回_1_1", picture: "./VPA/2023_第2回_1_1picture.png", voice: "./VPA/2023_第2回_1_1voice.mp3", script: "./VPA/2023_第2回_1_1script.txt" },
    { id: "2023_第2回_1_2", picture: "./VPA/2023_第2回_1_2picture.png", voice: "./VPA/2023_第2回_1_2voice.mp3", script: "./VPA/2023_第2回_1_2script.txt" },
    { id: "2023_第2回_1_3", picture: "./VPA/2023_第2回_1_3picture.png", voice: "./VPA/2023_第2回_1_3voice.mp3", script: "./VPA/2023_第2回_1_3script.txt" }
  ];
  const unit2Set2Questions = [
    { id: "2023_第2回_2_1", picture: "./VPA/2023_第2回_2_1picture.png", voice: "./VPA/2023_第2回_2_1voice.mp3", script: "./VPA/2023_第2回_2_1script.txt" },
    { id: "2023_第2回_2_2", picture: "./VPA/2023_第2回_2_2picture.png", voice: "./VPA/2023_第2回_2_2voice.mp3", script: "./VPA/2023_第2回_2_2script.txt" },
    { id: "2023_第2回_2_3", picture: "./VPA/2023_第2回_2_3picture.png", voice: "./VPA/2023_第2回_2_3voice.mp3", script: "./VPA/2023_第2回_2_3script.txt" },
    { id: "2023_第2回_2_4", picture: "./VPA/2023_第2回_2_4picture.png", voice: "./VPA/2023_第2回_2_4voice.mp3", script: "./VPA/2023_第2回_2_4script.txt" }
  ];

  // 2023_第3回
  const unit3Set1Questions = [
    { id: "2023_第3回_1_1", picture: "./VPA/2023_第3回_1_1picture.png", voice: "./VPA/2023_第3回_1_1voice.mp3", script: "./VPA/2023_第3回_1_1script.txt" },
    { id: "2023_第3回_1_2", picture: "./VPA/2023_第3回_1_2picture.png", voice: "./VPA/2023_第3回_1_2voice.mp3", script: "./VPA/2023_第3回_1_2script.txt" },
    { id: "2023_第3回_1_3", picture: "./VPA/2023_第3回_1_3picture.png", voice: "./VPA/2023_第3回_1_3voice.mp3", script: "./VPA/2023_第3回_1_3script.txt" }
  ];
  const unit3Set2Questions = [
    { id: "2023_第3回_2_1", picture: "./VPA/2023_第3回_2_1picture.png", voice: "./VPA/2023_第3回_2_1voice.mp3", script: "./VPA/2023_第3回_2_1script.txt" },
    { id: "2023_第3回_2_2", picture: "./VPA/2023_第3回_2_2picture.png", voice: "./VPA/2023_第3回_2_2voice.mp3", script: "./VPA/2023_第3回_2_2script.txt" },
    { id: "2023_第3回_2_3", picture: "./VPA/2023_第3回_2_3picture.png", voice: "./VPA/2023_第3回_2_3voice.mp3", script: "./VPA/2023_第3回_2_3script.txt" },
    { id: "2023_第3回_2_4", picture: "./VPA/2023_第3回_2_4picture.png", voice: "./VPA/2023_第3回_2_4voice.mp3", script: "./VPA/2023_第3回_2_4script.txt" }
  ];

  // 2023_第4回
  const unit4Set1Questions = [
    { id: "2023_第4回_1_1", picture: "./VPA/2023_第4回_1_1picture.png", voice: "./VPA/2023_第4回_1_1voice.mp3", script: "./VPA/2023_第4回_1_1script.txt" },
    { id: "2023_第4回_1_2", picture: "./VPA/2023_第4回_1_2picture.png", voice: "./VPA/2023_第4回_1_2voice.mp3", script: "./VPA/2023_第4回_1_2script.txt" },
    { id: "2023_第4回_1_3", picture: "./VPA/2023_第4回_1_3picture.png", voice: "./VPA/2023_第4回_1_3voice.mp3", script: "./VPA/2023_第4回_1_3script.txt" }
  ];
  const unit4Set2Questions = [
    { id: "2023_第4回_2_1", picture: "./VPA/2023_第4回_2_1picture.png", voice: "./VPA/2023_第4回_2_1voice.mp3", script: "./VPA/2023_第4回_2_1script.txt" },
    { id: "2023_第4回_2_2", picture: "./VPA/2023_第4回_2_2picture.png", voice: "./VPA/2023_第4回_2_2voice.mp3", script: "./VPA/2023_第4回_2_2script.txt" },
    { id: "2023_第4回_2_3", picture: "./VPA/2023_第4回_2_3picture.png", voice: "./VPA/2023_第4回_2_3voice.mp3", script: "./VPA/2023_第4回_2_3script.txt" },
    { id: "2023_第4回_2_4", picture: "./VPA/2023_第4回_2_4picture.png", voice: "./VPA/2023_第4回_2_4voice.mp3", script: "./VPA/2023_第4回_2_4script.txt" }
  ];

  // 2024_第1回
  const unit5Set1Questions = [
    { id: "2024_第1回_1_1", picture: "./VPA/2024_第1回_1_1picture.png", voice: "./VPA/2024_第1回_1_1voice.mp3", script: "./VPA/2024_第1回_1_1script.txt" },
    { id: "2024_第1回_1_2", picture: "./VPA/2024_第1回_1_2picture.png", voice: "./VPA/2024_第1回_1_2voice.mp3", script: "./VPA/2024_第1回_1_2script.txt" },
    { id: "2024_第1回_1_3", picture: "./VPA/2024_第1回_1_3picture.png", voice: "./VPA/2024_第1回_1_3voice.mp3", script: "./VPA/2024_第1回_1_3script.txt" }
  ];
  const unit5Set2Questions = [
    { id: "2024_第1回_2_1", picture: "./VPA/2024_第1回_2_1picture.png", voice: "./VPA/2024_第1回_2_1voice.mp3", script: "./VPA/2024_第1回_2_1script.txt" },
    { id: "2024_第1回_2_2", picture: "./VPA/2024_第1回_2_2picture.png", voice: "./VPA/2024_第1回_2_2voice.mp3", script: "./VPA/2024_第1回_2_2script.txt" },
    { id: "2024_第1回_2_3", picture: "./VPA/2024_第1回_2_3picture.png", voice: "./VPA/2024_第1回_2_3voice.mp3", script: "./VPA/2024_第1回_2_3script.txt" },
    { id: "2024_第1回_2_4", picture: "./VPA/2024_第1回_2_4picture.png", voice: "./VPA/2024_第1回_2_4voice.mp3", script: "./VPA/2024_第1回_2_4script.txt" }
  ];

  // 2024_第2回
  const unit6Set1Questions = [
    { id: "2024_第2回_1_1", picture: "./VPA/2024_第2回_1_1picture.png", voice: "./VPA/2024_第2回_1_1voice.mp3", script: "./VPA/2024_第2回_1_1script.txt" },
    { id: "2024_第2回_1_2", picture: "./VPA/2024_第2回_1_2picture.png", voice: "./VPA/2024_第2回_1_2voice.mp3", script: "./VPA/2024_第2回_1_2script.txt" },
    { id: "2024_第2回_1_3", picture: "./VPA/2024_第2回_1_3picture.png", voice: "./VPA/2024_第2回_1_3voice.mp3", script: "./VPA/2024_第2回_1_3script.txt" }
  ];
  const unit6Set2Questions = [
    { id: "2024_第2回_2_1", picture: "./VPA/2024_第2回_2_1picture.png", voice: "./VPA/2024_第2回_2_1voice.mp3", script: "./VPA/2024_第2回_2_1script.txt" },
    { id: "2024_第2回_2_2", picture: "./VPA/2024_第2回_2_2picture.png", voice: "./VPA/2024_第2回_2_2voice.mp3", script: "./VPA/2024_第2回_2_2script.txt" },
    { id: "2024_第2回_2_3", picture: "./VPA/2024_第2回_2_3picture.png", voice: "./VPA/2024_第2回_2_3voice.mp3", script: "./VPA/2024_第2回_2_3script.txt" },
    { id: "2024_第2回_2_4", picture: "./VPA/2024_第2回_2_4picture.png", voice: "./VPA/2024_第2回_2_4voice.mp3", script: "./VPA/2024_第2回_2_4script.txt" }
  ];

  // 2024_第3回
  const unit7Set1Questions = [
    { id: "2024_第3回_1_1", picture: "./VPA/2024_第3回_1_1picture.png", voice: "./VPA/2024_第3回_1_1voice.mp3", script: "./VPA/2024_第3回_1_1script.txt" },
    { id: "2024_第3回_1_2", picture: "./VPA/2024_第3回_1_2picture.png", voice: "./VPA/2024_第3回_1_2voice.mp3", script: "./VPA/2024_第3回_1_2script.txt" },
    { id: "2024_第3回_1_3", picture: "./VPA/2024_第3回_1_3picture.png", voice: "./VPA/2024_第3回_1_3voice.mp3", script: "./VPA/2024_第3回_1_3script.txt" }
  ];
  const unit7Set2Questions = [
    { id: "2024_第3回_2_1", picture: "./VPA/2024_第3回_2_1picture.png", voice: "./VPA/2024_第3回_2_1voice.mp3", script: "./VPA/2024_第3回_2_1script.txt" },
    { id: "2024_第3回_2_2", picture: "./VPA/2024_第3回_2_2picture.png", voice: "./VPA/2024_第3回_2_2voice.mp3", script: "./VPA/2024_第3回_2_2script.txt" },
    { id: "2024_第3回_2_3", picture: "./VPA/2024_第3回_2_3picture.png", voice: "./VPA/2024_第3回_2_3voice.mp3", script: "./VPA/2024_第3回_2_3script.txt" },
    { id: "2024_第3回_2_4", picture: "./VPA/2024_第3回_2_4picture.png", voice: "./VPA/2024_第3回_2_4voice.mp3", script: "./VPA/2024_第3回_2_4script.txt" }
  ];

  // 2024_第4回
  const unit8Set1Questions = [
    { id: "2024_第4回_1_1", picture: "./VPA/2024_第4回_1_1picture.png", voice: "./VPA/2024_第4回_1_1voice.mp3", script: "./VPA/2024_第4回_1_1script.txt" },
    { id: "2024_第4回_1_2", picture: "./VPA/2024_第4回_1_2picture.png", voice: "./VPA/2024_第4回_1_2voice.mp3", script: "./VPA/2024_第4回_1_2script.txt" },
    { id: "2024_第4回_1_3", picture: "./VPA/2024_第4回_1_3picture.png", voice: "./VPA/2024_第4回_1_3voice.mp3", script: "./VPA/2024_第4回_1_3script.txt" }
  ];
  const unit8Set2Questions = [
    { id: "2024_第4回_2_1", picture: "./VPA/2024_第4回_2_1picture.png", voice: "./VPA/2024_第4回_2_1voice.mp3", script: "./VPA/2024_第4回_2_1script.txt" },
    { id: "2024_第4回_2_2", picture: "./VPA/2024_第4回_2_2picture.png", voice: "./VPA/2024_第4回_2_2voice.mp3", script: "./VPA/2024_第4回_2_2script.txt" },
    { id: "2024_第4回_2_3", picture: "./VPA/2024_第4回_2_3picture.png", voice: "./VPA/2024_第4回_2_3voice.mp3", script: "./VPA/2024_第4回_2_3script.txt" },
    { id: "2024_第4回_2_4", picture: "./VPA/2024_第4回_2_4picture.png", voice: "./VPA/2024_第4回_2_4voice.mp3", script: "./VPA/2024_第4回_2_4script.txt" }
  ];

  // 新規追加：共通テスト2025年度（回答は数字 1～4）
  const unit10Questions = [
    { id: "共テ2025年度_1A_1", picture: "./VPA/共通テスト2025/共テ2025年度_1A_1picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_1A_1voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_1A_1script.txt" },
    { id: "共テ2025年度_1A_2", picture: "./VPA/共通テスト2025/共テ2025年度_1A_2picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_1A_2voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_1A_2script.txt" },
    { id: "共テ2025年度_1A_3", picture: "./VPA/共通テスト2025/共テ2025年度_1A_3picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_1A_3voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_1A_3script.txt" },
    { id: "共テ2025年度_1A_4", picture: "./VPA/共通テスト2025/共テ2025年度_1A_4picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_1A_4voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_1A_4script.txt" }
  ];
  const unit11Questions = [
    { id: "共テ2025年度_1B_5", picture: "./VPA/共通テスト2025/共テ2025年度_1B_5picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_1B_5voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_1B_5script.txt" },
    { id: "共テ2025年度_1B_6", picture: "./VPA/共通テスト2025/共テ2025年度_1B_6picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_1B_6voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_1B_6script.txt" },
    { id: "共テ2025年度_1B_7", picture: "./VPA/共通テスト2025/共テ2025年度_1B_7picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_1B_7voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_1B_7script.txt" },
    { id: "共テ2025年度_1B_8", picture: "./VPA/共通テスト2025/共テ2025年度_1B_8picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_1B_8voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_1B_8script.txt" }
  ];
  const unit12Questions = [
    { id: "共テ2025年度_2_9", picture: "./VPA/共通テスト2025/共テ2025年度_2_9picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_2_9voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_2_9script.txt" },
    { id: "共テ2025年度_2_10", picture: "./VPA/共通テスト2025/共テ2025年度_2_10picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_2_10voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_2_10script.txt" },
    { id: "共テ2025年度_2_11", picture: "./VPA/共通テスト2025/共テ2025年度_2_11picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_2_11voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_2_11script.txt" }
  ];
  const unit13Questions = [
    { id: "共テ2025年度_3_12", picture: "./VPA/共通テスト2025/共テ2025年度_3_12picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_3_12voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_3_12script.txt" },
    { id: "共テ2025年度_3_13", picture: "./VPA/共通テスト2025/共テ2025年度_3_13picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_3_13voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_3_13script.txt" },
    { id: "共テ2025年度_3_14", picture: "./VPA/共通テスト2025/共テ2025年度_3_14picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_3_14voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_3_14script.txt" },
    { id: "共テ2025年度_3_15", picture: "./VPA/共通テスト2025/共テ2025年度_3_15picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_3_15voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_3_15script.txt" },
    { id: "共テ2025年度_3_16", picture: "./VPA/共通テスト2025/共テ2025年度_3_16picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_3_16voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_3_16script.txt" },
    { id: "共テ2025年度_3_17", picture: "./VPA/共通テスト2025/共テ2025年度_3_17picture.png", voice: "./VPA/共通テスト2025/共テ2025年度_3_17voice.mp3", script: "./VPA/共通テスト2025/共テ2025年度_3_17script.txt" }
  ];

    // ── 新規追加：2024_第6回 ──
    const unit14Set1Questions = [
      { id: "2024_第6回_1_1", picture: "./VPA/2024_第6回_1_1picture.png", voice: "./VPA/2024_第6回_1_1voice.mp3", script: "./VPA/2024_第6回_1_1script.txt" },
      { id: "2024_第6回_1_2", picture: "./VPA/2024_第6回_1_2picture.png", voice: "./VPA/2024_第6回_1_2voice.mp3", script: "./VPA/2024_第6回_1_2script.txt" },
      { id: "2024_第6回_1_3", picture: "./VPA/2024_第6回_1_3picture.png", voice: "./VPA/2024_第6回_1_3voice.mp3", script: "./VPA/2024_第6回_1_3script.txt" }
    ];
    const unit14Set2Questions = [
      { id: "2024_第6回_2_1", picture: "./VPA/2024_第6回_2_1picture.png", voice: "./VPA/2024_第6回_2_1voice.mp3", script: "./VPA/2024_第6回_2_1script.txt" },
      { id: "2024_第6回_2_2", picture: "./VPA/2024_第6回_2_2picture.png", voice: "./VPA/2024_第6回_2_2voice.mp3", script: "./VPA/2024_第6回_2_2script.txt" },
      { id: "2024_第6回_2_3", picture: "./VPA/2024_第6回_2_3picture.png", voice: "./VPA/2024_第6回_2_3voice.mp3", script: "./VPA/2024_第6回_2_3script.txt" },
      { id: "2024_第6回_2_4", picture: "./VPA/2024_第6回_2_4picture.png", voice: "./VPA/2024_第6回_2_4voice.mp3", script: "./VPA/2024_第6回_2_4script.txt" }
    ];
  

  // 各単元選択ボタンのイベント設定
  document.getElementById('unit0Button').addEventListener('click', function() {
    selectedUnit = "2022_第1回";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit1Button').addEventListener('click', function() {
    selectedUnit = "2023_第1回";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit2Button').addEventListener('click', function() {
    selectedUnit = "2023_第2回";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit3Button').addEventListener('click', function() {
    selectedUnit = "2023_第3回";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit4Button').addEventListener('click', function() {
    selectedUnit = "2023_第4回";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit5Button').addEventListener('click', function() {
    selectedUnit = "2024_第1回";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit6Button').addEventListener('click', function() {
    selectedUnit = "2024_第2回";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit7Button').addEventListener('click', function() {
    selectedUnit = "2024_第3回";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit8Button').addEventListener('click', function() {
    selectedUnit = "2024_第4回";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit9Button').addEventListener('click', function() {
    selectedUnit = "2022_第3回";
    showScene('questionSelectionScene');
  });
  // 新規：共テ単元のボタン
  document.getElementById('unit10Button').addEventListener('click', function() {
    selectedUnit = "共テ2025年度_1A";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit11Button').addEventListener('click', function() {
    selectedUnit = "共テ2025年度_1B";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit12Button').addEventListener('click', function() {
    selectedUnit = "共テ2025年度_2";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit13Button').addEventListener('click', function() {
    selectedUnit = "共テ2025年度_3";
    showScene('questionSelectionScene');
  });
  document.getElementById('unit14Button').addEventListener('click', function() {
    selectedUnit = "2024_第6回";
    showScene('questionSelectionScene');
  });
  document.getElementById('creditButton').addEventListener('click', function() {
    showScene('creditScene');
  });

  // セット選択ボタン（既存単元用）と新規単元はバグ表示
  document.getElementById('selectSet1Button').addEventListener('click', function() {
    if (selectedUnit && selectedUnit.startsWith("共テ2025年度")) {
      // 共テの場合は「問1,2」の表示はバグである旨のメッセージを表示
      document.getElementById('questionSelectionScene').innerHTML = "<p>※問1,2の表示はバグでした。どちらを選んでも、トップ画面で選んだ大問が出題されます。</p><button id='goToExplanationButton'>進む</button>";
      document.getElementById('goToExplanationButton').addEventListener('click', function() {
        if (selectedUnit === "共テ2025年度_1A") {
          currentQuestions = unit10Questions;
          document.getElementById('explanationImage').src = "./VPA/共通テスト2025/共テ2025年度_1A_0explanation.png";
        } else if (selectedUnit === "共テ2025年度_1B") {
          currentQuestions = unit11Questions;
          document.getElementById('explanationImage').src = "./VPA/共通テスト2025/共テ2025年度_1B_0explanation.png";
        } else if (selectedUnit === "共テ2025年度_2") {
          currentQuestions = unit12Questions;
          document.getElementById('explanationImage').src = "./VPA/共通テスト2025/共テ2025年度_2_0explanation.png";
        } else if (selectedUnit === "共テ2025年度_3") {
          currentQuestions = unit13Questions;
          document.getElementById('explanationImage').src = "./VPA/共通テスト2025/共テ2025年度_3_0explanation.png";
        } 

        showScene('explanationScene');
      });
    } else {
      selectedSet = 1;
      if (selectedUnit === "2022_第1回") {
        currentQuestions = unit0Set1Questions;
        document.getElementById('explanationImage').src = "./VPA/2022_第1回_1_0explanation.png";
      } else if (selectedUnit === "2022_第3回") {
        currentQuestions = unit9Set1Questions;
        document.getElementById('explanationImage').src = "./VPA/2022_第3回_1_0explanation.png";
      } else if (selectedUnit === "2023_第1回") {
        currentQuestions = unit1Set1Questions;
        document.getElementById('explanationImage').src = "./VPA/2023_第1回_1_0explanation.png";
      } else if (selectedUnit === "2023_第2回") {
        currentQuestions = unit2Set1Questions;
        document.getElementById('explanationImage').src = "./VPA/2023_第2回_1_0explanation.png";
      } else if (selectedUnit === "2023_第3回") {
        currentQuestions = unit3Set1Questions;
        document.getElementById('explanationImage').src = "./VPA/2023_第3回_1_0explanation.png";
      } else if (selectedUnit === "2023_第4回") {
        currentQuestions = unit4Set1Questions;
        document.getElementById('explanationImage').src = "./VPA/2023_第4回_1_0explanation.png";
      } else if (selectedUnit === "2024_第1回") {
        currentQuestions = unit5Set1Questions;
        document.getElementById('explanationImage').src = "./VPA/2024_第1回_1_0explanation.png";
      } else if (selectedUnit === "2024_第2回") {
        currentQuestions = unit6Set1Questions;
        document.getElementById('explanationImage').src = "./VPA/2024_第2回_1_0explanation.png";
      } else if (selectedUnit === "2024_第3回") {
        currentQuestions = unit7Set1Questions;
        document.getElementById('explanationImage').src = "./VPA/2024_第3回_1_0explanation.png";
      } else if (selectedUnit === "2024_第4回") {
        currentQuestions = unit8Set1Questions;
        document.getElementById('explanationImage').src = "./VPA/2024_第4回_1_0explanation.png";
      } 
      else if (selectedUnit === "2024_第6回") {
        currentQuestions = unit14Set1Questions;
        document.getElementById('explanationImage').src = "./VPA/2024_第4回_1_0explanation.png";
      } 
      showScene('explanationScene');
    }
  });

  // セット選択ボタン for 問2（同様の処理）
  document.getElementById('selectSet2Button').addEventListener('click', function() {
    if (selectedUnit && selectedUnit.startsWith("共テ2025年度")) {
      document.getElementById('questionSelectionScene').innerHTML = "<p>※問1,2の表示はバグです。どちらを選んでも、トップ画面で選んだ大問の問題が出題されます。</p><button id='goToExplanationButton'>進む</button>";
      document.getElementById('goToExplanationButton').addEventListener('click', function() {
        if (selectedUnit === "共テ2025年度_1A") {
          currentQuestions = unit10Questions;
          document.getElementById('explanationImage').src = "./VPA/共通テスト2025/共テ2025年度_1A_0explanation.png";
        } else if (selectedUnit === "共テ2025年度_1B") {
          currentQuestions = unit11Questions;
          document.getElementById('explanationImage').src = "./VPA/共通テスト2025/共テ2025年度_1B_0explanation.png";
        } else if (selectedUnit === "共テ2025年度_2") {
          currentQuestions = unit12Questions;
          document.getElementById('explanationImage').src = "./VPA/共通テスト2025/共テ2025年度_2_0explanation.png";
        } else if (selectedUnit === "共テ2025年度_3") {
          currentQuestions = unit13Questions;
          document.getElementById('explanationImage').src = "./VPA/共通テスト2025/共テ2025年度_3_0explanation.png";
        }
        showScene('explanationScene');
      });
    } else {
      selectedSet = 2;
      if (selectedUnit === "2022_第1回") {
        currentQuestions = unit0Set2Questions;
        document.getElementById('explanationImage').src = "./VPA/2022_第1回_2_0explanation.png";
      } else if (selectedUnit === "2022_第3回") {
        currentQuestions = unit9Set2Questions;
        document.getElementById('explanationImage').src = "./VPA/2022_第3回_2_0explanation.png";
      } else if (selectedUnit === "2023_第1回") {
        currentQuestions = unit1Set2Questions;
        document.getElementById('explanationImage').src = "./VPA/2023_第1回_2_0explanation.png";
      } else if (selectedUnit === "2023_第2回") {
        currentQuestions = unit2Set2Questions;
        document.getElementById('explanationImage').src = "./VPA/2023_第2回_2_0explanation.png";
      } else if (selectedUnit === "2023_第3回") {
        currentQuestions = unit3Set2Questions;
        document.getElementById('explanationImage').src = "./VPA/2023_第3回_2_0explanation.png";
      } else if (selectedUnit === "2023_第4回") {
        currentQuestions = unit4Set2Questions;
        document.getElementById('explanationImage').src = "./VPA/2023_第4回_2_0explanation.png";
      } else if (selectedUnit === "2024_第1回") {
        currentQuestions = unit5Set2Questions;
        document.getElementById('explanationImage').src = "./VPA/2024_第1回_2_0explanation.png";
      } else if (selectedUnit === "2024_第2回") {
        currentQuestions = unit6Set2Questions;
        document.getElementById('explanationImage').src = "./VPA/2024_第2回_2_0explanation.png";
      } else if (selectedUnit === "2024_第3回") {
        currentQuestions = unit7Set2Questions;
        document.getElementById('explanationImage').src = "./VPA/2024_第3回_2_0explanation.png";
      } else if (selectedUnit === "2024_第4回") {
        currentQuestions = unit8Set2Questions;
        document.getElementById('explanationImage').src = "./VPA/2024_第4回_2_0explanation.png";
      }
      else if (selectedUnit === "2024_第6回") {
        currentQuestions = unit14Set2Questions;
        document.getElementById('explanationImage').src = "./VPA/2024_第6回_2_0explanation.png";
    }
      showScene('explanationScene');
    }
  });

  // クイズ開始ボタン
  document.getElementById('startQuizButton').addEventListener('click', function() {
    currentQuestionIndex = 0;
    results = [];
    loadQuestion();
    showScene('quizScene');
  });

  // 結果画面へ遷移する関数
  function showResult() {
    let resultDetailsHTML = '<ul>';
    let correctCount = 0;
    results.forEach(res => {
      resultDetailsHTML += `<li>${res.id}：${res.correct ? '正解' : '不正解'} （再生ボタン：${res.playCount}回）</li>`;
      if (res.correct) correctCount++;
    });
    resultDetailsHTML += '</ul>';
    document.getElementById('resultDetails').innerHTML = resultDetailsHTML;
    document.getElementById('finalScore').textContent = `全 ${results.length} 問中、${correctCount} 問正解！`;
    showScene('resultScene');
  }

  // loadQuestion 関数
  function loadQuestion() {
    answerSubmitted = false;
    currentPlayCount = 0;
    metadataLoaded = false;
    const showAnswerButton = document.getElementById('showAnswerButton');
    const nextQuestionButton = document.getElementById('nextQuestionButton');
    if (showAnswerButton) {
      showAnswerButton.disabled = true;
      showAnswerButton.style.opacity = 0.5;
    }
    if (nextQuestionButton) {
      nextQuestionButton.disabled = true;
      nextQuestionButton.style.opacity = 0.5;
    }
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('scriptContainer').style.display = 'none';
    document.getElementById('answerButtons').style.display = 'block';
    document.querySelectorAll('.answerButton').forEach(btn => {
      btn.disabled = false;
      btn.style.backgroundColor = '';
    });
    const question = currentQuestions[currentQuestionIndex];
    if (!question) {
      alert("問題データが存在しません。");
      return;
    }
    document.getElementById('questionImage').src = question.picture;
    const voiceElem = document.getElementById('voiceFilename');
    if (voiceElem) {
      console.log("Setting voiceFilename to:", question.voice);
      voiceElem.textContent = question.voice;
    } else {
      console.error("Element with ID 'voiceFilename' not found!");
    }
    // audioPlayer更新
    audioPlayer.pause();
    audioPlayer.src = encodeURI(question.voice);
    audioPlayer.load();
    audioPlayer.volume = 1.0;
    audioPlayer.playbackRate = playbackSpeed;
    audioPlayer.onloadedmetadata = function() {
      metadataLoaded = true;
      console.log("Metadata loaded, duration =", audioPlayer.duration);
    };
    audioPlayer.onended = function() {
      document.getElementById('playPauseButton').textContent = '再生';
    };
    audioPlayer.ontimeupdate = updateProgressBar;
    document.getElementById('playPauseButton').textContent = '再生';
    if (nextQuestionButton) {
      nextQuestionButton.textContent = (currentQuestionIndex === currentQuestions.length - 1) ? "結果画面へ" : "次の問題へ";
    }
    // 新規単元の場合は回答ボタンラベルを「1,2,3,4」に変更；既存単元は「ア, イ, ウ, エ」
    if (selectedUnit && selectedUnit.startsWith("共テ2025年度")) {
      document.querySelectorAll('.answerButton').forEach((btn, index) => {
        btn.textContent = (index + 1).toString();
        btn.setAttribute('data-answer', (index + 1).toString());
      });
    } else {
      const labels = ["ア", "イ", "ウ", "エ"];
      document.querySelectorAll('.answerButton').forEach((btn, index) => {
        btn.textContent = labels[index];
        btn.setAttribute('data-answer', labels[index]);
      });
    }
  }

  // 再生／一時停止ボタン
  document.getElementById('playPauseButton').addEventListener('click', function() {
    if (!audioPlayer) return;
    audioPlayer.muted = false;
    if (audioPlayer.paused) {
      if (!answerSubmitted) { currentPlayCount++; }
      console.log("Attempting to play audio at currentTime:", audioPlayer.currentTime);
      audioPlayer.play().then(() => {
        this.textContent = '一時停止';
        console.log("Audio playing.");
      }).catch(err => {
        console.error("Audio play error:", err);
      });
    } else {
      audioPlayer.pause();
      this.textContent = '再生';
    }
  });

  // 3秒前ボタン
  document.getElementById('rewind3').addEventListener('click', function() {
    if (!audioPlayer || !metadataLoaded) return;
    let newTime = audioPlayer.currentTime - 3;
    if (newTime < 0) newTime = 0;
    audioPlayer.currentTime = newTime;
    if (!audioPlayer.paused) {
      audioPlayer.play().then(() => {
        document.getElementById('playPauseButton').textContent = '一時停止';
      }).catch(err => {
        console.error("Audio play error:", err);
      });
    }
  });

  // 3秒後ボタン
  document.getElementById('forward3').addEventListener('click', function() {
    if (!audioPlayer || !metadataLoaded) return;
    let newTime = audioPlayer.currentTime + 3;
    if (audioPlayer.duration && newTime > audioPlayer.duration) newTime = audioPlayer.duration;
    audioPlayer.currentTime = newTime;
    if (!audioPlayer.paused) {
      audioPlayer.play().then(() => {
        document.getElementById('playPauseButton').textContent = '一時停止';
      }).catch(err => {
        console.error("Audio play error:", err);
      });
    }
  });

  // 音声最初へボタン
  document.getElementById('restartAudio').addEventListener('click', function() {
    if (!audioPlayer) return;
    audioPlayer.currentTime = 0;
    audioPlayer.play().then(() => {
      document.getElementById('playPauseButton').textContent = '一時停止';
    }).catch(err => {
      console.error("Audio play error:", err);
    });
  });

  // 速度変更用ボタン
  document.getElementById('slowDownButton').addEventListener('click', function() {
    if (playbackSpeed > 0.5) {
      playbackSpeed = Math.max(0.5, playbackSpeed - 0.1);
      audioPlayer.playbackRate = playbackSpeed;
      updateSpeedUI();
    }
  });
  document.getElementById('speedUpButton').addEventListener('click', function() {
    if (playbackSpeed < 1.5) {
      playbackSpeed = Math.min(1.5, playbackSpeed + 0.1);
      audioPlayer.playbackRate = playbackSpeed;
      updateSpeedUI();
    }
  });
  updateSpeedUI();

  // 速度ノブのドラッグ操作（マウス＆タッチ対応）
  function onSpeedKnobDrag(event) {
    event.preventDefault();
    let clientX = event.clientX;
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
    }
    const rect = speedBarContainer.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;
    playbackSpeed = 0.5 + (offsetX / rect.width) * 1.0;
    audioPlayer.playbackRate = playbackSpeed;
    updateSpeedUI();
  }
  speedKnob.addEventListener('mousedown', function(event) {
    document.addEventListener('mousemove', onSpeedKnobDrag);
    document.addEventListener('mouseup', function mouseUpHandler(e) {
      document.removeEventListener('mousemove', onSpeedKnobDrag);
      document.removeEventListener('mouseup', mouseUpHandler);
    });
  });
  speedKnob.addEventListener('touchstart', function(event) {
    document.addEventListener('touchmove', onSpeedKnobDrag);
    document.addEventListener('touchend', function touchEndHandler(e) {
      document.removeEventListener('touchmove', onSpeedKnobDrag);
      document.removeEventListener('touchend', touchEndHandler);
    });
  });
  updateSpeedUI();

  // 回答ボタンの設定
  const answerButtons = document.querySelectorAll('.answerButton');
  answerButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (answerSubmitted) return;
      answerSubmitted = true;
      const showAnswerButton = document.getElementById('showAnswerButton');
      const nextQuestionButton = document.getElementById('nextQuestionButton');
      const userAnswer = this.getAttribute('data-answer');
      let correctAnswer;
      // 修正：共テ単元の場合は「問1」の配列から取得
      if (selectedUnit && selectedUnit.startsWith("共テ2025年度")) {
        correctAnswer = correctAnswers[selectedUnit]["問1"][currentQuestionIndex];
      } else {
        correctAnswer = correctAnswers[selectedUnit]["問" + selectedSet][currentQuestionIndex];
      }
      const isCorrect = (userAnswer === correctAnswer);
      if (isCorrect) {
        new Audio('SE/Seikai.mp3').play().catch(err => console.error("Audio play error:", err));
      } else {
        new Audio('SE/Machigai.mp3').play().catch(err => console.error("Audio play error:", err));
      }
      const feedbackDiv = document.getElementById('feedback');
      feedbackDiv.style.display = 'block';
      feedbackDiv.textContent = isCorrect ? '正解！' : '不正解！';
      feedbackDiv.style.color = isCorrect ? 'green' : 'red';
      answerButtons.forEach(btn => btn.disabled = true);
      results.push({ id: currentQuestions[currentQuestionIndex].id, correct: isCorrect, playCount: currentPlayCount });
      // 2秒後にスクリプト取得・表示し、ボタンを有効化
      setTimeout(function() {
        document.getElementById('answerButtons').style.display = 'none';
        fetch(encodeURI(currentQuestions[currentQuestionIndex].script))
          .then(response => response.text())
          .then(text => {
            const scriptContainer = document.getElementById('scriptContainer');
            scriptContainer.textContent = text;
            scriptContainer.style.display = 'block';
            if (showAnswerButton) {
              showAnswerButton.disabled = false;
              showAnswerButton.style.opacity = 1;
            }
            if (nextQuestionButton) {
              nextQuestionButton.disabled = false;
              nextQuestionButton.style.opacity = 1;
            }
          })
          .catch(err => {
            console.error('スクリプト読み込みエラー:', err);
            const scriptContainer = document.getElementById('scriptContainer');
            scriptContainer.textContent = "スクリプトの読み込みに失敗しました。";
            scriptContainer.style.display = 'block';
            if (showAnswerButton) {
              showAnswerButton.disabled = false;
              showAnswerButton.style.opacity = 1;
            }
            if (nextQuestionButton) {
              nextQuestionButton.disabled = false;
              nextQuestionButton.style.opacity = 1;
            }
          });
      }, 2000);
    });
  });

  // 「解答を表示」ボタン
  const showAnswerButton = document.getElementById('showAnswerButton');
  if (showAnswerButton) {
    showAnswerButton.addEventListener('click', function() {
      let correctAnswer;
      // 修正：共テ単元の場合は「問1」の配列から取得
      if (selectedUnit && selectedUnit.startsWith("共テ2025年度")) {
        correctAnswer = correctAnswers[selectedUnit]["問1"][currentQuestionIndex];
      } else {
        correctAnswer = correctAnswers[selectedUnit]["問" + selectedSet][currentQuestionIndex];
      }
      alert("正解は " + correctAnswer + " です。");
    });
  } else {
    console.error("Element with ID 'showAnswerButton' not found!");
  }

  // 「次の問題へ」ボタン
  const nextQuestionButton = document.getElementById('nextQuestionButton');
  if (nextQuestionButton) {
    nextQuestionButton.addEventListener('click', function() {
      audioPlayer.pause();
      if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
        showAnswerButton.disabled = true;
        showAnswerButton.style.opacity = 0.5;
        nextQuestionButton.disabled = true;
        nextQuestionButton.style.opacity = 0.5;
      } else {
        showResult();
      }
    });
  } else {
    console.error("Element with ID 'nextQuestionButton' not found!");
  }

  // 「トップへ」ボタン（クイズシーン）
  const backToTopButton = document.getElementById('backToTopButton');
  if (backToTopButton) {
    backToTopButton.addEventListener('click', function() {
      if (confirm("本当にトップ画面へ戻りますか？\n「OK」でトップへ、「キャンセル」で現在の問題に戻ります。")) {
        audioPlayer.pause();
        showScene('topScene');
      }
    });
  } else {
    console.error("Element with ID 'backToTopButton' not found!");
  }

  // 「トップへ戻る」ボタン（リザルトシーン）
  const resultBackButton = document.getElementById('resultBackButton');
  if (resultBackButton) {
    resultBackButton.addEventListener('click', function() {
      if (confirm("本当にトップ画面へ戻りますか？\n「OK」でトップへ、「キャンセル」で結果画面に留まります。")) {
        showScene('topScene');
      }
    });
  } else {
    console.error("Element with ID 'resultBackButton' not found!");
  }

  // 「トップへ戻る」ボタン（クレジットシーン）
  const creditBackButton = document.getElementById('creditBackButton');
  if (creditBackButton) {
    creditBackButton.addEventListener('click', function() {
      showScene('topScene');
    });
  } else {
    console.error("Element with ID 'creditBackButton' not found!");
  }

  // クイズ開始後の loadQuestion 関数（下書きが重複している場合は上書きされます）
  function loadQuestion() {
    answerSubmitted = false;
    currentPlayCount = 0;
    metadataLoaded = false;
    if (showAnswerButton) {
      showAnswerButton.disabled = true;
      showAnswerButton.style.opacity = 0.5;
    }
    if (nextQuestionButton) {
      nextQuestionButton.disabled = true;
      nextQuestionButton.style.opacity = 0.5;
    }
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('scriptContainer').style.display = 'none';
    document.getElementById('answerButtons').style.display = 'block';
    document.querySelectorAll('.answerButton').forEach(btn => {
      btn.disabled = false;
      btn.style.backgroundColor = '';
    });
    const question = currentQuestions[currentQuestionIndex];
    if (!question) {
      alert("問題データが存在しません。");
      return;
    }
    document.getElementById('questionImage').src = question.picture;
    const voiceElem = document.getElementById('voiceFilename');
    if (voiceElem) {
      console.log("Setting voiceFilename to:", question.voice);
      voiceElem.textContent = question.voice;
    } else {
      console.error("Element with ID 'voiceFilename' not found!");
    }
    // audioPlayer更新
    audioPlayer.pause();
    audioPlayer.src = encodeURI(question.voice);
    audioPlayer.load();
    audioPlayer.volume = 1.0;
    audioPlayer.playbackRate = playbackSpeed;
    audioPlayer.onloadedmetadata = function() {
      metadataLoaded = true;
      console.log("Metadata loaded, duration =", audioPlayer.duration);
    };
    audioPlayer.onended = function() {
      document.getElementById('playPauseButton').textContent = '再生';
    };
    audioPlayer.ontimeupdate = updateProgressBar;
    document.getElementById('playPauseButton').textContent = '再生';
    if (nextQuestionButton) {
      nextQuestionButton.textContent = (currentQuestionIndex === currentQuestions.length - 1) ? "結果画面へ" : "次の問題へ";
    }
    // 回答ボタンのラベル設定（新規単元は「1,2,3,4」、既存は「ア, イ, ウ, エ」）
    if (selectedUnit && selectedUnit.startsWith("共テ2025年度")) {
      document.querySelectorAll('.answerButton').forEach((btn, index) => {
        btn.textContent = (index + 1).toString();
        btn.setAttribute('data-answer', (index + 1).toString());
      });
    } else {
      const labels = ["ア", "イ", "ウ", "エ"];
      document.querySelectorAll('.answerButton').forEach((btn, index) => {
        btn.textContent = labels[index];
        btn.setAttribute('data-answer', labels[index]);
      });
    }
  }

  updateSpeedUI();
})();
