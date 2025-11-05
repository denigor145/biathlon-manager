class GameUI {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'mainMenu';
        
        console.log("GameUI создан!");
        
        // Даем время на загрузку DOM
        setTimeout(() => {
            this.setupMenuEventListeners();
            this.setupGameEventListeners();
        }, 100);
    }

    // Управление экранами
    showScreen(screenId) {
        console.log(`Переключение на экран: ${screenId}`);
        
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем нужный экран
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    // Настройка обработчиков меню
    setupMenuEventListeners() {
        console.log("Настройка обработчиков меню...");
        
        // Выбор гонки
        document.querySelectorAll('.race-card').forEach(card => {
            card.addEventListener('click', () => {
                this.handleRaceCardClick(card);
            });
        });

        // Кнопка "Начать гонку"
        document.getElementById('startRace').addEventListener('click', () => {
            this.handleStartRace();
        });

        // Кнопка "Настройки"
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        // Кнопка "Статистика"
        document.getElementById('statsBtn').addEventListener('click', () => {
            this.showStats();
        });
    }

    // Настройка обработчиков игры
    setupGameEventListeners() {
        console.log("Настройка обработчиков игры...");
        
        // Кнопки управления
        document.getElementById('sprintBtn').addEventListener('click', () => {
            this.handleSprint();
        });

        document.getElementById('slowBtn').addEventListener('click', () => {
            this.handleSlowPace();
        });

        document.getElementById('menuBtn').addEventListener('click', () => {
            this.showGameMenu();
        });
    }

    handleRaceCardClick(card) {
        // Убираем выделение у всех карточек
        document.querySelectorAll('.race-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Выделяем выбранную карточку
        card.classList.add('selected');
        
        const raceType = card.getAttribute('data-race');
        this.game.selectRaceType(raceType);
    }

    handleStartRace() {
        console.log("=== START RACE CLICKED ===");
        
        const selectedRace = this.game.getSelectedRace();
        console.log("Selected race:", selectedRace);
        
        if (selectedRace) {
            this.startGame();
        } else {
            alert('Пожалуйста, выберите тип гонки!');
        }
    }

    startGame() {
        console.log("Starting game...");
        
        // Запускаем гонку
        const success = this.game.startRace();
        console.log("Race started:", success);
        
        if (success) {
            this.showScreen('gameScreen');
            this.updateDisplay();
        }
    }

    handleSprint() {
        console.log("Sprint button clicked");
        const success = this.game.activateSprint();
        if (!success) {
            alert("Недостаточно выносливости для спринта!");
        }
        this.updateDisplay();
    }

    handleSlowPace() {
        console.log("Slow pace button clicked");
        this.game.activateSlowPace();
        this.updateDisplay();
    }

    showGameMenu() {
        const race = this.game.getCurrentRace();
        let message = `🏁 ${race.name}\n`;
        message += `📊 Сегмент: ${this.game.currentSegment}/${race.totalSegments}\n`;
        message += `🏅 Позиция: ${this.game.player.position}\n`;
        message += `💪 Выносливость: ${Math.round(this.game.player.stamina)}%`;
        
        alert(message);
    }

    showSettings() {
        alert('⚙️ Настройки пока не реализованы\n\nВ будущих версиях здесь можно будет:\n• Настроить сложность\n• Изменить управление\n• Включить/выключить звук');
    }

    showStats() {
        alert('📊 Статистика пока не реализована\n\nВ будущих версиях здесь будет:\n• История гонок\n• Лучшие результаты\n• Прогресс игрока');
    }

    // Управление экраном стрельбы
    showShootingScreen(shootingRound) {
        const shootingScreen = document.getElementById('shootingScreen');
        const roundName = document.getElementById('shootingRoundName');
        
        roundName.textContent = shootingRound.name;
        shootingScreen.classList.add('active');
        
        // Сбрасываем мишени
        this.resetTargets();
        
        // Сбрасываем прогресс
        this.updateShootingProgress(0);
    }

    hideShootingScreen() {
        const shootingScreen = document.getElementById('shootingScreen');
        shootingScreen.classList.remove('active');
    }

    resetTargets() {
        for (let i = 1; i <= 5; i++) {
            const target = document.getElementById(`target${i}`);
            target.classList.remove('hit', 'miss');
        }
        
        // Сбрасываем статистику
        document.getElementById('shootingHits').textContent = '0';
        document.getElementById('penaltyTime').textContent = '0';
    }

    updateTarget(targetIndex, isHit) {
        const target = document.getElementById(`target${targetIndex + 1}`);
        
        if (isHit) {
            target.classList.add('hit');
            target.classList.remove('miss');
        } else {
            target.classList.add('miss');
            target.classList.remove('hit');
        }
        
        // Обновляем прогресс
        const progress = ((targetIndex + 1) / 5) * 100;
        this.updateShootingProgress(progress);
    }

    updateShootingTimer(timeLeft) {
        document.getElementById('shootingTime').textContent = timeLeft;
    }

    updateShootingProgress(percent) {
        const progressFill = document.getElementById('shootingProgress');
        progressFill.style.width = percent + '%';
    }

    showShootingResult(hits, penaltyTime) {
        document.getElementById('shootingHits').textContent = hits;
        document.getElementById('penaltyTime').textContent = penaltyTime;
        
        // Завершаем прогресс
        this.updateShootingProgress(100);
    }

    // Обновление дисплея
    updateDisplay() {
        if (this.currentScreen !== 'gameScreen') return;

        const race = this.game.getCurrentRace();
        
        // Обновляем круги и отрезки
        const currentLap = this.game.getCurrentLap();
        const currentSegmentInLap = this.game.getCurrentSegmentInLap();
        
        document.getElementById('currentLap').textContent = currentLap;
        document.getElementById('totalLaps').textContent = race.totalLaps;
        document.getElementById('currentSegmentInLap').textContent = currentSegmentInLap;
        document.getElementById('totalSegmentsPerLap').textContent = race.segmentsPerLap;
        
        // Обновляем индикаторы
        document.getElementById('pulseValue').textContent = Math.round(this.game.player.pulse);
        document.getElementById('staminaValue').textContent = Math.round(this.game.player.stamina
