class GameScreen {
    constructor() {
        this.isInitialized = false;
        
        console.log("GameScreen создан");
        
        // Даем время на загрузку DOM
        setTimeout(() => {
            this.initialize();
        }, 100);
    }
    
    initialize() {
        if (this.isInitialized) return;
        
        console.log("Инициализация GameScreen...");
        
        try {
            this.setupEventListeners();
            this.isInitialized = true;
            
            console.log("GameScreen успешно инициализирован");
        } catch (error) {
            console.error("Ошибка инициализации GameScreen:", error);
        }
    }
    
    setupEventListeners() {
        // Кнопки управления гонкой
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
        
        // Кнопки этапов гонки
        const startRaceStageBtn = document.getElementById('startRaceStageBtn');
        if (startRaceStageBtn) {
            startRaceStageBtn.addEventListener('click', () => {
                this.handleStartRaceStage();
            });
        }

        const startShootingBtn = document.getElementById('startShootingBtn');
        if (startShootingBtn) {
            startShootingBtn.addEventListener('click', () => {
                this.handleStartShooting();
            });
        }

        const continueAfterShootingBtn = document.getElementById('continueAfterShootingBtn');
        if (continueAfterShootingBtn) {
            continueAfterShootingBtn.addEventListener('click', () => {
                this.handleContinueAfterShooting();
            });
        }
        
        console.log("Обработчики GameScreen установлены");
    }
    
    handleSprint() {
        console.log("Sprint button clicked");
        if (window.biathlonGame) {
            const success = window.biathlonGame.activateSprint();
            if (!success) {
                this.showMessage("Недостаточно выносливости для спринта!", "error");
            } else {
                this.showMessage("💨 Спринт активирован!", "success");
            }
            this.updateDisplay();
        }
    }

    handleSlowPace() {
        console.log("Slow pace button clicked");
        if (window.biathlonGame) {
            window.biathlonGame.activateSlowPace();
            this.showMessage("🐢 Темп снижен", "info");
            this.updateDisplay();
        }
    }
    
    handleStartRaceStage() {
        console.log("Starting race after stage screen");
        if (window.biathlonGame) {
            window.biathlonGame.startRaceAfterStage();
            this.hideStageScreen('startStageScreen');
        }
    }
    
    handleStartShooting() {
        console.log("Starting shooting after stage screen");
        if (window.biathlonGame) {
            window.biathlonGame.startShootingAfterStage();
            this.hideStageScreen('preShootingScreen');
        }
    }
    
    handleContinueAfterShooting() {
        console.log("Continuing after shooting");
        if (window.biathlonGame) {
            window.biathlonGame.continueAfterShooting();
            this.hideStageScreen('postShootingScreen');
        }
    }
    
    showGameMenu() {
        if (!window.biathlonGame) return;
        
        const race = window.biathlonGame.getCurrentRace();
        let message = `🏁 ${race.name}\n`;
        message += `📊 Сегмент: ${window.biathlonGame.currentSegment}/${race.totalSegments}\n`;
        message += `🏅 Позиция: ${window.biathlonGame.player.position}\n`;
        message += `💪 Выносливость: ${Math.round(window.biathlonGame.player.stamina)}%\n`;
        message += `❤️ Пульс: ${Math.round(window.biathlonGame.player.pulse)}\n\n`;
        
        // Добавляем информацию о характеристиках
        if (window.playerProfile) {
            const stats = window.playerProfile.getAllStats();
            message += `📈 Характеристики:\n`;
            message += `🏃 Скорость: ${stats.runningSpeed}\n`;
            message += `🎯 Меткость: ${stats.accuracy}%\n`;
            message += `⚡ Стрельба: ${stats.shootingSpeed}\n`;
            message += `💪 Выносливость: ${stats.stamina}`;
        }
        
        alert(message);
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
            console.log(`Экран ${screenId} активирован`);
            
            // Если показываем игровой экран, обновляем отображение
            if (screenId === 'gameScreen') {
                this.updateDisplay();
            }
        }
    }
    
    // Показать экран этапа
    showStageScreen(screenId) {
        const stageScreen = document.getElementById(screenId);
        if (stageScreen) {
            stageScreen.classList.add('active');
            console.log(`Экран этапа ${screenId} показан`);
        }
    }
    
    // Скрыть экран этапа
    hideStageScreen(screenId) {
        const stageScreen = document.getElementById(screenId);
        if (stageScreen) {
            stageScreen.classList.remove('active');
            console.log(`Экран этапа ${screenId} скрыт`);
        }
    }
    
    // Скрыть все экраны этапов
    hideAllStageScreens() {
        const stageScreens = [
            'startStageScreen',
            'preShootingScreen', 
            'postShootingScreen'
        ];
        
        stageScreens.forEach(screenId => {
            this.hideStageScreen(screenId);
        });
    }
    
    // Показать стартовый экран гонки
    showStartStage() {
        if (!window.biathlonGame) return;
        
        const race = window.biathlonGame.getSelectedRace();
        
        // Заполняем информацию о гонке
        this.updateElement('startRaceName', `${race.name} - ${race.distance}`);
        this.updateElement('startDistance', race.distance);
        this.updateElement('startShootings', race.shootingRounds.length);
        this.updateElement('startPosition', window.biathlonGame.player.position);
        this.updateElement('startStamina', Math.round(window.biathlonGame.player.stamina) + '%');
        
        // Показываем экран
        this.showStageScreen('startStageScreen');
    }
    
    // Показать экран перед стрельбой
    showPreShootingStage(shootingRound) {
        if (!window.biathlonGame) return;
        
        const race = window.biathlonGame.getCurrentRace();
        
        // Заполняем информацию о стрельбе
        this.updateElement('preShootingTitle', `🎯 ${shootingRound.name}`);
        this.updateElement('preShootingPosition', window.biathlonGame.player.position);
        this.updateElement('preShootingGap', '+' + this.formatTime(window.biathlonGame.getPlayerGap()));
        
        // Точность стрельбы в зависимости от положения
        const accuracy = window.biathlonGame.player.shooting[shootingRound.position] * 100;
        this.updateElement('preShootingAccuracy', Math.round(accuracy) + '%');
        
        // Случайный ветер
        const wind = window.biathlonGame.getRandomWind();
        this.updateElement('preShootingWind', wind);
        
        // Показываем экран
        this.showStageScreen('preShootingScreen');
    }
    
    // Показать экран после стрельбы
    showPostShootingStage() {
        if (!window.biathlonGame) return;
        
        const shootingRound = window.biathlonGame.currentShootingRound;
        const results = window.biathlonGame.getShootingResults(window.biathlonGame.player);
        
        // Заполняем результаты стрельбы
        this.updateElement('postShootingSubtitle', shootingRound.name + ' завершена');
        this.updateElement('postShootingHits', `${results.hits}/5`);
        this.updateElement('postShootingMisses', results.misses);
        this.updateElement('postShootingPenalty', `+${results.misses * 10} сек`);
        
        // Показываем мишени
        this.updateShootingTargetsPreview(results);
        
        // Показываем экран
        this.showStageScreen('postShootingScreen');
    }
    
    // Обновить превью мишеней
    updateShootingTargetsPreview(results) {
        const container = document.getElementById('postShootingTargets');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const target = document.createElement('div');
            target.className = 'preview-target';
            
            if (results.shots[i] !== null) {
                target.classList.add(results.shots[i] ? 'hit' : 'miss');
            }
            
            container.appendChild(target);
        }
    }
    
    // Показать стрельбу в процессе
    showShootingInProgress() {
        // Сначала скрываем все экраны этапов
        this.hideAllStageScreens();
        
        // Показываем основной экран гонки
        this.showScreen('gameScreen');
        
        // Обновляем отображение
        this.updateDisplay();
    }
    
    // Скрыть стрельбу (вернуть нормальное отображение)
    hideShooting() {
        // Немедленно обновляем отображение
        this.updateDisplay();
    }
    
    // Обновление дисплея
    updateDisplay() {
        if (!window.biathlonGame) return;

        const race = window.biathlonGame.getCurrentRace();
        
        // Обновляем круги и отрезки
        const currentLap = window.biathlonGame.getCurrentLap();
        const currentSegmentInLap = window.biathlonGame.getCurrentSegmentInLap();
        
        this.updateElement('currentLap', currentLap);
        this.updateElement('totalLaps', race.totalLaps);
        this.updateElement('currentSegmentInLap', currentSegmentInLap);
        this.updateElement('totalSegmentsPerLap', race.segmentsPerLap);
        
        // Обновляем индикаторы
        this.updateElement('pulseValue', Math.round(window.biathlonGame.player.pulse));
        this.updateElement('staminaValue', Math.round(window.biathlonGame.player.stamina) + '%');
        
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

        if (!window.biathlonGame) return;
        
        const leader = window.biathlonGame.allCompetitors[0];
        const isShooting = window.biathlonGame.isShootingInProgress();
        const shootingStep = window.biathlonGame.getShootingStep();
        
        competitorsList.innerHTML = window.biathlonGame.allCompetitors.map(competitor => {
            const gap = competitor.time - leader.time;
            const shortName = this.formatShortName(competitor.name);
            
            if (isShooting) {
                const shootingResults = window.biathlonGame.getShootingResults(competitor);
                return this.createShootingRow(competitor, shortName, shootingResults, shootingStep, gap);
            } else {
                return this.createNormalRow(competitor, shortName, gap);
            }
        }).join('');
    }
    
    createNormalRow(competitor, shortName, gap) {
        return `
            <div class="compact-row ${competitor.isPlayer ? 'player' : ''}">
                <div class="position">${competitor.position}</div>
                <div class="flag">${competitor.flag}</div>
                <div class="name">${shortName}</div>
                <div class="gap">+${this.formatTime(gap)}</div>
            </div>
        `;
    }
    
    createShootingRow(competitor, shortName, shootingResults, shootingStep, gap) {
        let targetsHTML = '';

        if (shootingStep === 0) {
            // Ожидание стрельбы - черные мишени
            targetsHTML = `
                <div class="targets-inline">
                    <div class="inline-target"></div>
                    <div class="inline-target"></div>
                    <div class="inline-target"></div>
                    <div class="inline-target"></div>
                    <div class="inline-target"></div>
                </div>
            `;
        } else if (shootingStep <= 5) {
            // В процессе стрельбы
            targetsHTML = `<div class="targets-inline">`;
            
            for (let i = 0; i < 5; i++) {
                if (i < shootingStep - 1) {
                    // Уже выстреленные мишени
                    const isHit = shootingResults.shots[i];
                    targetsHTML += `<div class="inline-target ${isHit ? 'hit' : 'miss'}"></div>`;
                } else if (i === shootingStep - 1) {
                    // Текущая мишень (в процессе выстрела)
                    const isHit = shootingResults.shots[i];
                    if (isHit !== null) {
                        // Результат известен
                        targetsHTML += `<div class="inline-target ${isHit ? 'hit' : 'miss'}"></div>`;
                    } else {
                        // Ожидание результата
                        targetsHTML += `<div class="inline-target"></div>`;
                    }
                } else {
                    // Будущие мишени
                    targetsHTML += `<div class="inline-target"></div>`;
                }
            }
            targetsHTML += '</div>';
        } else {
            // Стрельба завершена - все мишени
            targetsHTML = '<div class="targets-inline">';
            for (let i = 0; i < 5; i++) {
                const isHit = shootingResults.shots[i];
                targetsHTML += `<div class="inline-target ${isHit ? 'hit' : 'miss'}"></div>`;
            }
            targetsHTML += '</div>';
        }

        return `
            <div class="compact-row ${competitor.isPlayer ? 'player' : ''}">
                <div class="position">${competitor.position}</div>
                <div class="flag">${competitor.flag}</div>
                <div class="name">${shortName}</div>
                <div class="targets-container" id="targets-${competitor.name.replace(/\s+/g, '-')}">
                    ${targetsHTML}
                </div>
            </div>
        `;
    }
    
    // Обновляем метод для запуска анимации промаха
    updateShootingStep(step) {
        this.updateDisplay();
        
        // Запускаем анимацию для промахов на текущем шаге
        if (step > 0 && step <= 5) {
            setTimeout(() => {
                if (!window.biathlonGame) return;
                
                window.biathlonGame.allCompetitors.forEach(competitor => {
                    const shootingResults = window.biathlonGame.getShootingResults(competitor);
                    if (shootingResults && shootingResults.shots[step - 1] === false) {
                        const containerId = `targets-${competitor.name.replace(/\s+/g, '-')}`;
                        const container = document.getElementById(containerId);
                        if (container) {
                            // Добавляем класс вспышки
                            container.classList.add('flash');
                            // Убираем через время анимации
                            setTimeout(() => {
                                container.classList.remove('flash');
                            }, 300);
                        }
                    }
                });
            }, 100);
        }
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
    
    showMessage(message, type = 'info') {
        // Создаем временное уведомление
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            transition: all 0.3s ease;
            max-width: 80%;
            text-align: center;
            font-size: 14px;
        `;
        
        // Стили в зависимости от типа сообщения
        switch(type) {
            case 'success':
                messageDiv.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
                messageDiv.style.color = 'white';
                break;
            case 'error':
                messageDiv.style.background = 'linear-gradient(135deg, #F44336, #C62828)';
                messageDiv.style.color = 'white';
                break;
            default:
                messageDiv.style.background = 'linear-gradient(135deg, #2196F3, #1565C0)';
                messageDiv.style.color = 'white';
        }
        
        document.body.appendChild(messageDiv);
        
        // Автоматически скрываем через 2 секунды
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 2000);
    }
    
    // Проверить инициализацию
    isReady() {
        return this.isInitialized;
    }
}
