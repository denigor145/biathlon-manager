class GameScreen {
    constructor() {
        this.isInitialized = false;
        this.lastUpdateTime = 0;
        this.updateInterval = null;
        
        console.log("GameScreen создан для непрерывной системы");
        
        setTimeout(() => {
            this.initialize();
        }, 100);
    }
    
    initialize() {
        if (this.isInitialized) return;
        
        console.log("Инициализация GameScreen для непрерывной системы...");
        
        try {
            this.setupEventListeners();
            this.setupUIElements();
            this.isInitialized = true;
            
            console.log("GameScreen успешно инициализирован для непрерывной системы");
        } catch (error) {
            console.error("Ошибка инициализации GameScreen:", error);
        }
    }
    
    setupEventListeners() {
        // Кнопки управления интенсивностью
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

        // Кнопка меню/паузы
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.showGameMenu();
            });
        }
        
        // Кнопка старта гонки после экрана старта
        const startRaceStageBtn = document.getElementById('startRaceStageBtn');
        if (startRaceStageBtn) {
            startRaceStageBtn.addEventListener('click', () => {
                this.handleStartRaceStage();
            });
        }
        
        console.log("Обработчики GameScreen установлены для непрерывной системы");
    }
    
    setupUIElements() {
        // Создаем дополнительные UI элементы для непрерывной системы
        this.createProgressIndicators();
        this.createIntensityDisplay();
    }
    
    createProgressIndicators() {
        // Добавляем индикатор прогресса круга в верхнюю панель
        const raceInfo = document.querySelector('.race-info');
        if (raceInfo && !document.getElementById('lapProgressContainer')) {
            const progressContainer = document.createElement('div');
            progressContainer.id = 'lapProgressContainer';
            progressContainer.style.cssText = `
                flex: 1;
                max-width: 200px;
                margin: 0 15px;
            `;
            
            progressContainer.innerHTML = `
                <div style="font-size: 11px; color: #4FC3F7; margin-bottom: 4px; text-align: center;">
                    ПРОГРЕСС КРУГА
                </div>
                <div class="progress-bar" style="background: rgba(255,255,255,0.1); border-radius: 10px; height: 6px; overflow: hidden;">
                    <div class="progress-fill" id="lapProgressFill" style="background: linear-gradient(135deg, #4CAF50, #2E7D32); height: 100%; border-radius: 10px; width: 0%; transition: width 0.5s ease;"></div>
                </div>
                <div style="font-size: 10px; color: rgba(255,255,255,0.7); text-align: center; margin-top: 2px;">
                    <span id="lapProgressText">0%</span>
                </div>
            `;
            
            raceInfo.insertBefore(progressContainer, raceInfo.querySelector('.player-stats'));
        }
    }
    
    createIntensityDisplay() {
        // Добавляем отображение уровня интенсивности
        const playerStats = document.querySelector('.player-stats');
        if (playerStats && !document.getElementById('intensityDisplay')) {
            const intensityDiv = document.createElement('div');
            intensityDiv.id = 'intensityDisplay';
            intensityDiv.className = 'stat-item';
            intensityDiv.innerHTML = `
                <span class="stat-label">⚡</span>
                <span class="stat-value" id="intensityValue">4</span>
            `;
            playerStats.appendChild(intensityDiv);
        }
    }
    
    handleSprint() {
        console.log("Sprint button clicked");
        if (window.biathlonGame && window.biathlonGame.player) {
            const success = window.biathlonGame.activateSprint();
            if (success) {
                this.showMessage("💨 Спринт активирован!", "success");
            } else {
                this.showMessage("Недостаточно выносливости для спринта!", "error");
            }
            this.updateDisplay();
        }
    }

    handleSlowPace() {
        console.log("Slow pace button clicked");
        if (window.biathlonGame && window.biathlonGame.player) {
            const success = window.biathlonGame.activateSlowPace();
            if (success) {
                this.showMessage("🐢 Медленный темп активирован", "info");
            }
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
    
    showGameMenu() {
        if (!window.biathlonGame) return;
        
        const game = window.biathlonGame;
        const race = game.getCurrentRace();
        const player = game.player;
        
        let message = `🏁 ${race.name}\n`;
        message += `📍 Локация: ${game.location.name}\n`;
        message += `📏 Пройдено: ${Math.round(player.distanceCovered)}/${race.totalDistance}м\n`;
        message += `🏅 Позиция: ${player.position}\n`;
        message += `💪 Выносливость: ${Math.round(player.stamina)}%\n`;
        message += `❤️ Пульс: ${Math.round(player.pulse)}\n`;
        message += `⚡ Интенсивность: ${GameConstants.INTENSITY_LEVELS[player.intensityLevel].name}\n`;
        message += `⏱️ Общее время: ${this.formatTime(player.totalTime)}\n`;
        
        if (player.penaltyLoops > 0) {
            message += `⏰ Штрафные круги: ${player.penaltyLoops}\n`;
        }
        
        if (player.penaltyMinutes > 0) {
            message += `⚠️ Штрафные минуты: ${player.penaltyMinutes / 60} мин\n`;
        }
        
        message += `\n`;
        
        // Информация о состоянии
        let stateText = 'Гонка';
        if (player.currentState === GameConstants.PLAYER_STATES.SHOOTING) stateText = 'Стрельба';
        if (player.currentState === GameConstants.PLAYER_STATES.PENALTY_LOOP) stateText = 'Штрафные круги';
        if (player.finished) stateText = 'Финишировал';
        
        message += `📊 Состояние: ${stateText}\n`;
        
        // Информация о текущем прогрессе
        if (player.currentState === GameConstants.PLAYER_STATES.RACING) {
            message += `📈 Прогресс круга: ${Math.round(player.lapProgress * 100)}%\n`;
        } else if (player.currentState === GameConstants.PLAYER_STATES.SHOOTING) {
            message += `🎯 Прогресс стрельбы: ${Math.round(player.shootingProgress * 100)}%\n`;
        } else if (player.currentState === GameConstants.PLAYER_STATES.PENALTY_LOOP) {
            message += `⏰ Прогресс штрафов: ${Math.round(player.penaltyProgress * 100)}%\n`;
        }
        
        // Информация о характеристиках
        if (window.playerProfile) {
            const stats = window.playerProfile.getAllStats();
            message += `\n📈 Характеристики:\n`;
            message += `🏃 Скорость: ${window.playerProfile.getFormattedStat('runningSpeed')}\n`;
            message += `🎯 Меткость: ${window.playerProfile.getFormattedStat('accuracy')}\n`;
            message += `⚡ Стрельба: ${window.playerProfile.getFormattedStat('shootingSpeed')}\n`;
            message += `💪 Выносливость: ${window.playerProfile.getFormattedStat('stamina')}\n`;
            
            const progressInfo = window.playerProfile.getProgressInfo();
            message += `\n📊 Расчетные показатели:\n`;
            message += `• Время круга: ${progressInfo.lapTime}\n`;
            message += `• Время стрельбы: ${progressInfo.shootingTime}\n`;
            message += `• Меткость лёжа: ${progressInfo.accuracyProne}\n`;
            message += `• Меткость стоя: ${progressInfo.accuracyStanding}`;
        }
        
        // Добавляем опции меню
        message += `\n\n--- УПРАВЛЕНИЕ ---\n`;
        message += `💨 Спринт - кнопка "Спринт!"\n`;
        message += `🐢 Медленный темп - кнопка "Снизить темп"\n`;
        message += `⏸️ Пауза - кнопка "Меню" (здесь)\n`;
        
        const userChoice = confirm(message + "\n\nХотите поставить гонку на паузу?");
        if (userChoice) {
            window.biathlonGame.pauseRace();
        }
    }
    
    // Основное обновление интерфейса
    updateDisplay() {
        if (!window.biathlonGame || !window.biathlonGame.isRacing) return;

        const game = window.biathlonGame;
        const race = game.getCurrentRace();
        const player = game.player;
        
        // Обновляем основную информацию
        this.updateBasicInfo(player, race);
        
        // Обновляем прогресс круга
        this.updateLapProgress(player);
        
        // Обновляем таблицу лидеров
        this.updateCompetitorsList();
        
        // Обновляем отображение стрельбы
        this.updateShootingDisplay(player);
        
        // Обновляем отображение штрафов
        this.updatePenaltyDisplay(player);
        
        // Обновляем состояние кнопок
        this.updateControlButtons(player);
    }
    
    updateBasicInfo(player, race) {
        // Круги и сегменты
        this.updateElement('currentLap', player.currentLap);
        this.updateElement('totalLaps', race.totalLaps);
        
        // Физиологические показатели
        this.updateElement('pulseValue', Math.round(player.pulse));
        this.updateElement('staminaValue', Math.round(player.stamina) + '%');
        
        // Уровень интенсивности
        this.updateElement('intensityValue', player.intensityLevel);
        
        // Прогресс дистанции
        const progressElement = document.getElementById('distanceProgress');
        if (progressElement) {
            const progress = (player.distanceCovered / race.totalDistance) * 100;
            progressElement.style.width = Math.min(100, progress) + '%';
        }
        
        // Текущая дистанция
        this.updateElement('currentDistance', Math.round(player.distanceCovered) + 'м');
        this.updateElement('totalDistance', race.totalDistance + 'м');
    }
    
    updateLapProgress(player) {
        const progressFill = document.getElementById('lapProgressFill');
        const progressText = document.getElementById('lapProgressText');
        
        if (progressFill && progressText) {
            const progress = player.lapProgress * 100;
            progressFill.style.width = progress + '%';
            progressText.textContent = Math.round(progress) + '%';
            
            // Меняем цвет в зависимости от состояния
            if (player.currentState === GameConstants.PLAYER_STATES.SHOOTING) {
                progressFill.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
                progressText.textContent = 'СТРЕЛЬБА';
            } else if (player.currentState === GameConstants.PLAYER_STATES.PENALTY_LOOP) {
                progressFill.style.background = 'linear-gradient(135deg, #F44336, #C62828)';
                progressText.textContent = 'ШТРАФЫ';
            } else {
                progressFill.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
            }
        }
    }
    
    updateCompetitorsList() {
        const competitorsList = document.getElementById('competitorsList');
        if (!competitorsList) {
            console.error("competitorsList не найден!");
            return;
        }

        if (!window.biathlonGame) return;
        
        const game = window.biathlonGame;
        const leader = game.allCompetitors[0];
        
        competitorsList.innerHTML = game.allCompetitors.map(competitor => {
            const gap = game.getPlayerGap ? game.getPlayerGap(competitor) : competitor.totalTime - leader.totalTime;
            const shortName = this.formatShortName(competitor.name);
            const penaltyValue = game.getPenaltyDisplayValue(competitor);
            
            // Определяем состояние для отображения
            let stateIcon = '';
            let stateClass = '';
            
            if (competitor.currentState === GameConstants.PLAYER_STATES.SHOOTING) {
                stateIcon = '🎯';
                stateClass = 'shooting';
            } else if (competitor.currentState === GameConstants.PLAYER_STATES.PENALTY_LOOP) {
                stateIcon = '⏱️';
                stateClass = 'penalty';
            } else if (competitor.finished) {
                stateIcon = '🏁';
                stateClass = 'finished';
            }
            
            if (competitor.currentState === GameConstants.PLAYER_STATES.SHOOTING) {
                return this.createShootingRow(competitor, shortName, gap, penaltyValue, stateIcon, stateClass);
            } else {
                return this.createNormalRow(competitor, shortName, gap, penaltyValue, stateIcon, stateClass);
            }
        }).join('');
    }

    createNormalRow(competitor, shortName, gap, penaltyValue, stateIcon, stateClass) {
        // Добавляем отображение уровня для ботов
        const levelInfo = !competitor.isPlayer ? 
            `<div style="font-size: 9px; color: #888; margin-top: 2px;">Ур. ${competitor.level}</div>` : '';
        
        // Добавляем иконку состояния
        const stateDisplay = stateIcon ? `<span style="margin-left: 5px;">${stateIcon}</span>` : '';
        
        // Форматируем отставание
        const gapDisplay = competitor.position === 1 ? '' : `+${this.formatTime(gap)}`;
        
        return `
            <div class="compact-row ${competitor.isPlayer ? 'player' : ''} ${stateClass}">
                <div class="position">${competitor.position}</div>
                <div class="flag">${competitor.flag}</div>
                <div class="name">
                    ${shortName}${stateDisplay}
                    ${levelInfo}
                </div>
                <div class="gap">${gapDisplay}</div>
                <div class="penalty">${penaltyValue > 0 ? penaltyValue : ''}</div>
            </div>
        `;
    }

    createShootingRow(competitor, shortName, gap, penaltyValue, stateIcon, stateClass) {
        const results = window.biathlonGame.getShootingResults(competitor);
        let targetsHTML = '<div class="targets-inline">';
        
        for (let i = 0; i < 5; i++) {
            let targetClass = 'inline-target';
            if (i < competitor.shotsFired) {
                targetClass += results.shots[i] ? ' hit' : ' miss';
            } else {
                targetClass += ' pending';
            }
            targetsHTML += `<div class="${targetClass}"></div>`;
        }
        
        targetsHTML += '</div>';

        // Добавляем отображение уровня для ботов
        const levelInfo = !competitor.isPlayer ? 
            `<div style="font-size: 9px; color: #888; margin-top: 2px;">Ур. ${competitor.level}</div>` : '';

        // Форматируем отставание
        const gapDisplay = competitor.position === 1 ? '' : `+${this.formatTime(gap)}`;

        return `
            <div class="compact-row ${competitor.isPlayer ? 'player' : 'shooting'} ${stateClass}">
                <div class="position">${competitor.position}</div>
                <div class="flag">${competitor.flag}</div>
                <div class="name">
                    ${shortName} 🎯
                    ${levelInfo}
                </div>
                <div class="targets-container">
                    ${targetsHTML}
                </div>
                <div class="penalty">${penaltyValue > 0 ? penaltyValue : ''}</div>
            </div>
        `;
    }
    
    updateShootingDisplay(player) {
        const shootingScreen = document.getElementById('shootingScreen');
        if (shootingScreen) {
            if (player.currentState === GameConstants.PLAYER_STATES.SHOOTING) {
                shootingScreen.style.display = 'block';
                
                // Обновляем информацию о стрельбе
                const shootingRoundName = document.getElementById('shootingRoundName');
                if (shootingRoundName && player.currentShootingRound) {
                    shootingRoundName.textContent = player.currentShootingRound.name;
                }
                
                const shootingTimer = document.getElementById('shootingTimer');
                if (shootingTimer) {
                    shootingTimer.textContent = `Выстрелов: ${player.shotsFired}/5`;
                }
                
                // Обновляем прогресс стрельбы
                const shootingProgress = document.getElementById('shootingProgress');
                if (shootingProgress) {
                    shootingProgress.style.width = (player.shootingProgress * 100) + '%';
                }
                
                // Обновляем текст прогресса
                const shootingProgressText = document.getElementById('shootingProgressText');
                if (shootingProgressText) {
                    shootingProgressText.textContent = `${player.shotsFired}/5 выстрелов`;
                }
                
                // Обновляем мишени
                this.updateTargetsDisplay(player);
            } else {
                shootingScreen.style.display = 'none';
            }
        }
    }
    
    updateTargetsDisplay(player) {
        const targetsContainer = document.getElementById('targetsContainer');
        if (!targetsContainer) return;
        
        let targetsHTML = '<div class="targets-grid">';
        
        for (let i = 0; i < 5; i++) {
            let targetClass = 'target';
            let targetStatus = '';
            
            if (i < player.shotsFired) {
                targetClass += player.shootingResults[i] ? ' target-hit' : ' target-miss';
                targetStatus = player.shootingResults[i] ? 'Попадание' : 'Промах';
            } else if (i === player.shotsFired) {
                targetClass += ' target-aiming';
                targetStatus = 'Прицеливание...';
            } else {
                targetClass += ' target-waiting';
                targetStatus = 'Ожидание';
            }
            
            targetsHTML += `
                <div class="target-cell">
                    <div class="${targetClass}">
                        <div class="target-number">${i + 1}</div>
                    </div>
                    <div class="target-status">${targetStatus}</div>
                </div>
            `;
        }
        
        targetsHTML += '</div>';
        targetsContainer.innerHTML = targetsHTML;
    }
    
    updatePenaltyDisplay(player) {
        // Обновляем отображение штрафов в таблице лидеров
        // (уже делается в updateCompetitorsList)
        
        // Дополнительно можно показывать уведомления о штрафах
        if (player.currentState === GameConstants.PLAYER_STATES.PENALTY_LOOP && player.penaltyProgress === 0) {
            this.showMessage("⏱️ Начало штрафных кругов", "warning");
        }
    }
    
    updateControlButtons(player) {
        const sprintBtn = document.getElementById('sprintBtn');
        const slowBtn = document.getElementById('slowBtn');
        
        if (sprintBtn) {
            // Проверяем доступность спринта
            const canSprint = player.stamina >= GameConstants.STAMINA_RESTRICTIONS[7];
            sprintBtn.disabled = !canSprint || player.currentState !== GameConstants.PLAYER_STATES.RACING;
            
            if (sprintBtn.disabled) {
                sprintBtn.style.opacity = '0.5';
                sprintBtn.style.cursor = 'not-allowed';
            } else {
                sprintBtn.style.opacity = '1';
                sprintBtn.style.cursor = 'pointer';
            }
        }
        
        if (slowBtn) {
            // Замедление всегда доступно во время гонки
            slowBtn.disabled = player.currentState !== GameConstants.PLAYER_STATES.RACING;
            
            if (slowBtn.disabled) {
                slowBtn.style.opacity = '0.5';
                slowBtn.style.cursor = 'not-allowed';
            } else {
                slowBtn.style.opacity = '1';
                slowBtn.style.cursor = 'pointer';
            }
        }
    }
    
    // Вспомогательные методы
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
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
        if (seconds < 0) return '0:00.0';
        
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins}:${secs.padStart(4, '0')}`;
    }
    
    // Управление экранами
    showScreen(screenId) {
        console.log(`Переключение на экран: ${screenId}`);
        
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            console.log(`Экран ${screenId} активирован`);
            
            if (screenId === 'gameScreen') {
                this.startContinuousUpdate();
            }
        }
    }
    
    showStageScreen(screenId) {
        const stageScreen = document.getElementById(screenId);
        if (stageScreen) {
            stageScreen.classList.add('active');
            console.log(`Экран этапа ${screenId} показан`);
        }
    }
    
    hideStageScreen(screenId) {
        const stageScreen = document.getElementById(screenId);
        if (stageScreen) {
            stageScreen.classList.remove('active');
            console.log(`Экран этапа ${screenId} скрыт`);
        }
    }
    
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
    
    // Непрерывное обновление интерфейса
    startContinuousUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            if (window.biathlonGame && window.biathlonGame.isRacing && !window.biathlonGame.isPaused) {
                this.updateDisplay();
            }
        }, 500); // Обновляем каждые 500мс
    }
    
    stopContinuousUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    showStartStage() {
        if (!window.biathlonGame) return;
        
        const game = window.biathlonGame;
        const race = game.getCurrentRace();
        const player = game.player;
        
        this.updateElement('startRaceName', `${race.name} - ${(race.totalDistance / 1000).toFixed(2)} км`);
        this.updateElement('startDistance', (race.totalDistance / 1000).toFixed(2) + ' км');
        this.updateElement('startShootings', race.shootingRounds.length);
        this.updateElement('startPosition', player.position);
        this.updateElement('startStamina', Math.round(player.stamina) + '%');
        
        // Добавляем информацию о локации и характеристиках
        const startStageScreen = document.getElementById('startStageScreen');
        if (startStageScreen) {
            let locationInfo = startStageScreen.querySelector('.location-info');
            if (!locationInfo) {
                locationInfo = document.createElement('div');
                locationInfo.className = 'location-info';
                locationInfo.style.cssText = `
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                    padding: 10px;
                    margin: 15px 0;
                    text-align: center;
                `;
                const statsContainer = startStageScreen.querySelector('.stage-stats');
                statsContainer.parentNode.insertBefore(locationInfo, statsContainer);
            }
            
            locationInfo.innerHTML = `
                <div style="font-size: 0.9em; opacity: 0.8;">📍 ${game.location.name}</div>
                <div style="font-size: 0.8em; color: #FF5252; margin-top: 5px;">
                    Уровни ботов: ${game.location.botMinLevel}-${game.location.botMaxLevel}
                </div>
                <div style="font-size: 0.8em; color: #4FC3F7; margin-top: 5px;">
                    Сложность: ${'⭐'.repeat(game.location.difficulty)}
                </div>
            `;
            
            // Добавляем информацию о характеристиках игрока
            if (window.playerProfile) {
                const progressInfo = window.playerProfile.getProgressInfo();
                let statsInfo = startStageScreen.querySelector('.player-stats-info');
                if (!statsInfo) {
                    statsInfo = document.createElement('div');
                    statsInfo.className = 'player-stats-info';
                    statsInfo.style.cssText = `
                        background: rgba(255,255,255,0.05);
                        border-radius: 10px;
                        padding: 10px;
                        margin: 10px 0;
                        text-align: left;
                        font-size: 0.9em;
                    `;
                    locationInfo.parentNode.insertBefore(statsInfo, locationInfo.nextSibling);
                }
                
                statsInfo.innerHTML = `
                    <div style="color: #4FC3F7; margin-bottom: 8px; text-align: center;">📊 Ваши характеристики</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 0.8em;">
                        <div>Скорость:</div>
                        <div style="text-align: right; color: #FFD700;">${progressInfo.speed}</div>
                        <div>Время круга:</div>
                        <div style="text-align: right; color: #FFD700;">${progressInfo.lapTime}</div>
                        <div>Время стрельбы:</div>
                        <div style="text-align: right; color: #FFD700;">${progressInfo.shootingTime}</div>
                        <div>Меткость лёжа:</div>
                        <div style="text-align: right; color: #FFD700;">${progressInfo.accuracyProne}</div>
                    </div>
                `;
            }
        }
        
        this.showStageScreen('startStageScreen');
    }
    
    showMessage(message, type = 'info') {
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
        
        switch(type) {
            case 'success':
                messageDiv.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
                messageDiv.style.color = 'white';
                break;
            case 'error':
                messageDiv.style.background = 'linear-gradient(135deg, #F44336, #C62828)';
                messageDiv.style.color = 'white';
                break;
            case 'warning':
                messageDiv.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
                messageDiv.style.color = 'white';
                break;
            default:
                messageDiv.style.background = 'linear-gradient(135deg, #2196F3, #1565C0)';
                messageDiv.style.color = 'white';
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
    
    isReady() {
        return this.isInitialized;
    }
    
    // Очистка ресурсов
    cleanup() {
        this.stopContinuousUpdate();
    }
}
