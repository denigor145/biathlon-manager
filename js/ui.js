class GameUI {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'mainMenu';
        
        console.log("GameUI создан!");
        
        // Даем время на загрузку DOM
        setTimeout(() => {
            this.setupMenuEventListeners();
            this.setupGameEventListeners();
            console.log("Обработчики установлены");
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
            console.log(`Экран ${screenId} активирован`);
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
        const startBtn = document.getElementById('startRace');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.handleStartRace();
            });
        } else {
            console.error("Кнопка startRace не найдена!");
        }

        // Кнопка "Настройки"
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // Кнопка "Статистика"
        const statsBtn = document.getElementById('statsBtn');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                this.showStats();
            });
        }
    }

    // Настройка обработчиков игры
    setupGameEventListeners() {
        console.log("Настройка обработчиков игры...");
        
        // Кнопки управления
        const sprintBtn = document.getElementById('sprintBtn');
        if (sprintBtn) {
            sprintBtn.addEventListener('click', () => {
                this.handleSprint();
            });
        }

        const slowBtn = document.getElementById('slowBtn');
        if (slowBtn) {
            slowBtn.addEventListener('click', () => {
                this.handleSlowPace();
            });
        }

        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.showGameMenu();
            });
        }
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
        console.log(`Выбрана гонка: ${raceType}`);
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
        
        if (shootingScreen && roundName) {
            roundName.textContent = shootingRound.name;
            shootingScreen.classList.add('active');
            
            // Сбрасываем мишени
            this.resetTargets();
            
            // Сбрасываем прогресс
            this.updateShootingProgress(0);
            
            console.log("Экран стрельбы показан");
        } else {
            console.error("Элементы стрельбы не найдены!");
        }
    }

    hideShootingScreen() {
        const shootingScreen = document.getElementById('shootingScreen');
        if (shootingScreen) {
            shootingScreen.classList.remove('active');
            console.log("Экран стрельбы скрыт");
        }
    }

    resetTargets() {
        for (let i = 1; i <= 5; i++) {
            const target = document.getElementById(`target${i}`);
            if (target) {
                target.classList.remove('hit', 'miss');
            }
        }
        
        // Сбрасываем статистику
        const hitsElement = document.getElementById('shootingHits');
        const penaltyElement = document.getElementById('penaltyTime');
        if (hitsElement) hitsElement.textContent = '0';
        if (penaltyElement) penaltyElement.textContent = '0';
    }

    updateTarget(targetIndex, isHit) {
        const target = document.getElementById(`target${targetIndex + 1}`);
        
        if (target) {
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
            
            console.log(`Мишень ${targetIndex + 1} обновлена: ${isHit ? 'попадание' : 'промах'}`);
        }
    }

    updateShootingTimer(timeLeft) {
        const timeElement = document.getElementById('shootingTime');
        if (timeElement) {
            timeElement.textContent = timeLeft;
        }
    }

    updateShootingProgress(percent) {
        const progressFill = document.getElementById('shootingProgress');
        if (progressFill) {
            progressFill.style.width = percent + '%';
        }
    }

    showShootingResult(hits, penaltyTime) {
        const hitsElement = document.getElementById('shootingHits');
        const penaltyElement = document.getElementById('penaltyTime');
        
        if (hitsElement) hitsElement.textContent = hits;
        if (penaltyElement) penaltyElement.textContent = penaltyTime;
        
        // Завершаем прогресс
        this.updateShootingProgress(100);
        
        console.log(`Результат стрельбы: ${hits}/5, штраф: ${penaltyTime}сек`);
    }

    // Обновление дисплея
    updateDisplay() {
        if (this.currentScreen !== 'gameScreen') return;

        const race = this.game.getCurrentRace();
        
        // Обновляем круги и отрезки
        const currentLap = this.game.getCurrentLap();
        const currentSegmentInLap = this.game.getCurrentSegmentInLap();
        
        this.updateElement('currentLap', currentLap);
        this.updateElement('totalLaps', race.totalLaps);
        this.updateElement('currentSegmentInLap', currentSegmentInLap);
        this.updateElement('totalSegmentsPerLap', race.segmentsPerLap);
        
        // Обновляем индикаторы
        this.updateElement('pulseValue', Math.round(this.game.player.pulse));
        this.updateElement('staminaValue', Math.round(this.game.player.stamina) + '%');
        
        // Обновляем таблицу лидеров
        this.updateCompetitorsList();
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateCompetitorsList() {
        const competitorsList = document.getElementById('competitorsList');
        if (!competitorsList) {
            console.error("competitorsList не найден!");
            return;
        }

        const leader = this.game.allCompetitors[0];
        
        competitorsList.innerHTML = this.game.allCompetitors.map(competitor => {
            const gap = competitor.time - leader.time;
            const shortName = this.formatShortName(competitor.name);
            
            return `
                <div class="compact-row ${competitor.isPlayer ? 'player' : ''}">
                    <div class="position">${competitor.position}</div>
                    <div class="name">${shortName}</div>
                    <div class="gap">+${this.formatTime(gap)}</div>
                </div>
            `;
        }).join('');
    }

    formatShortName(fullName) {
        const parts = fullName.split(' ');
        if (parts.length >= 2) {
            return parts[0] + ' ' + parts[1].charAt(0) + '.';
        }
        return fullName;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
    }
}
