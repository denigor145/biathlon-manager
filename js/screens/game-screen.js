class GameScreen {
    constructor() {
        this.isInitialized = false;
        
        console.log("GameScreen создан");
        
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
        
        const startRaceStageBtn = document.getElementById('startRaceStageBtn');
        if (startRaceStageBtn) {
            startRaceStageBtn.addEventListener('click', () => {
                this.handleStartRaceStage();
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
    
    showGameMenu() {
        if (!window.biathlonGame) return;
        
        const race = window.biathlonGame.getCurrentRace();
        const location = window.biathlonGame.getCurrentLocation();
        const player = window.biathlonGame.player;
        
        let message = `🏁 ${race.name}\n`;
        message += `📍 Локация: ${location.name}\n`;
        message += `📏 Дистанция: ${Math.round(player.distanceCovered)}/${race.totalDistance}м\n`;
        message += `🏅 Позиция: ${player.position}\n`;
        message += `💪 Выносливость: ${Math.round(player.stamina)}%\n`;
        message += `❤️ Пульс: ${Math.round(player.pulse)}\n`;
        message += `⏱️ Общее время: ${this.formatTime(player.totalGameTime)}\n`;
        message += `🏃 Время гонки: ${this.formatTime(player.raceGameTime)}\n`;
        message += `🎯 Время стрельбы: ${this.formatTime(player.shootingGameTime)}\n`;
        
        if (player.penaltyGameTime > 0) {
            message += `⏰ Время штрафов: ${this.formatTime(player.penaltyGameTime)}\n`;
        }
        
        if (player.penaltyMinutes > 0) {
            message += `⚠️ Штрафные минуты: ${player.penaltyMinutes}\n`;
        }
        
        message += `\n`;
        
        // Информация о состоянии
        let stateText = 'Гонка';
        if (player.currentState === 'shooting') stateText = 'Стрельба';
        if (player.currentState === 'penalty_loop') stateText = 'Штрафные круги';
        if (player.finished) stateText = 'Финишировал';
        
        message += `📊 Состояние: ${stateText}\n`;
        
        // Информация о ботах на текущей локации
        message += `🤖 Уровни ботов: ${location.botMinLevel}-${location.botMaxLevel}\n\n`;
        
        if (window.playerProfile) {
            const stats = window.playerProfile.getAllStats();
            message += `📈 Характеристики:\n`;
            message += `🏃 Скорость: ${window.playerProfile.getFormattedStat('runningSpeed')}\n`;
            message += `🎯 Меткость: ${window.playerProfile.getFormattedStat('accuracy')}\n`;
            message += `⚡ Стрельба: ${window.playerProfile.getFormattedStat('shootingSpeed')}\n`;
            message += `💪 Выносливость: ${window.playerProfile.getFormattedStat('stamina')}\n`;
            message += `📊 Общий уровень: ${window.playerProfile.getPlayerLevel()}`;
        }
        
        alert(message);
    }
    
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
                this.updateDisplay();
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
    
    showStartStage() {
        if (!window.biathlonGame) return;
        
        const race = window.biathlonGame.getSelectedRace();
        const location = window.biathlonGame.getCurrentLocation();
        const player = window.biathlonGame.player;
        
        this.updateElement('startRaceName', `${race.name} - ${(race.totalDistance / 1000).toFixed(2)} км`);
        this.updateElement('startDistance', (race.totalDistance / 1000).toFixed(2) + ' км');
        this.updateElement('startShootings', race.shootingRounds.length);
        this.updateElement('startPosition', player.position);
        this.updateElement('startStamina', Math.round(player.stamina) + '%');
        
        // Добавляем информацию о локации и ботах
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
                <div style="font-size: 0.9em; opacity: 0.8;">📍 ${location.name}</div>
                <div style="font-size: 0.8em; color: #FF5252; margin-top: 5px;">
                    Уровни ботов: ${location.botMinLevel}-${location.botMaxLevel}
                </div>
                <div style="font-size: 0.8em; color: #4FC3F7; margin-top: 5px;">
                    Сложность: ${'⭐'.repeat(location.difficulty)}
                </div>
            `;
        }
        
        this.showStageScreen('startStageScreen');
    }
    
    updateDisplay() {
        if (!window.biathlonGame) return;

        const race = window.biathlonGame.getCurrentRace();
        const player = window.biathlonGame.player;
        
        // Обновляем информацию о кругах и сегментах
        this.updateElement('currentLap', player.currentLap);
        this.updateElement('totalLaps', race.totalLaps);
        this.updateElement('currentSegmentInLap', player.completedSegmentsInCurrentLap);
        
        // Определяем общее количество сегментов в текущем круге
        const totalSegmentsInLap = race.segmentsPerLap;
        this.updateElement('totalSegmentsPerLap', totalSegmentsInLap);
        
        // Обновляем физиологические показатели
        this.updateElement('pulseValue', Math.round(player.pulse));
        this.updateElement('staminaValue', Math.round(player.stamina) + '%');
        
        // Обновляем прогресс дистанции
        const progressElement = document.getElementById('distanceProgress');
        if (progressElement) {
            const progress = (player.distanceCovered / race.totalDistance) * 100;
            progressElement.style.width = Math.min(100, progress) + '%';
        }
        
        // Обновляем таблицу лидеров
        this.updateCompetitorsList();
        
        // Обновляем информацию о стрельбе, если игрок стреляет
        if (player.isShooting) {
            this.updateShootingDisplay(player);
        }
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
        
        competitorsList.innerHTML = window.biathlonGame.allCompetitors.map(competitor => {
            const gap = competitor.totalGameTime - leader.totalGameTime;
            const shortName = this.formatShortName(competitor.name);
            const penaltyValue = window.biathlonGame.getPenaltyDisplayValue(competitor);
            
            // Определяем состояние для отображения
            let stateIcon = '';
            if (competitor.currentState === 'shooting') stateIcon = '🎯';
            if (competitor.currentState === 'penalty_loop') stateIcon = '⏱️';
            if (competitor.finished) stateIcon = '🏁';
            
            if (competitor.isShooting) {
                return this.createShootingRow(competitor, shortName, gap, penaltyValue, stateIcon);
            } else {
                return this.createNormalRow(competitor, shortName, gap, penaltyValue, stateIcon);
            }
        }).join('');
    }

    createNormalRow(competitor, shortName, gap, penaltyValue, stateIcon) {
        // Добавляем отображение уровня для ботов
        const levelInfo = !competitor.isPlayer ? 
            `<div style="font-size: 9px; color: #888; margin-top: 2px;">Ур. ${competitor.level}</div>` : '';
        
        // Добавляем иконку состояния
        const stateDisplay = stateIcon ? `<span style="margin-left: 5px;">${stateIcon}</span>` : '';
        
        return `
            <div class="compact-row ${competitor.isPlayer ? 'player' : ''}">
                <div class="position">${competitor.position}</div>
                <div class="flag">${competitor.flag}</div>
                <div class="name">
                    ${shortName}${stateDisplay}
                    ${levelInfo}
                </div>
                <div class="gap">+${this.formatTime(gap)}</div>
                <div class="penalty">${penaltyValue > 0 ? penaltyValue : ''}</div>
            </div>
        `;
    }

    createShootingRow(competitor, shortName, gap, penaltyValue, stateIcon) {
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

        return `
            <div class="compact-row ${competitor.isPlayer ? 'player' : 'shooting'}">
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
            if (player.isShooting) {
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
                    const progress = (player.shotsFired / 5) * 100;
                    shootingProgress.style.width = progress + '%';
                }
            } else {
                shootingScreen.style.display = 'none';
            }
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
        }, 2000);
    }
    
    isReady() {
        return this.isInitialized;
    }
}
