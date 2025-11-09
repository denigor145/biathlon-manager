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
        let message = `🏁 ${race.name}\n`;
        message += `📍 Локация: ${location.name}\n`;
        message += `📊 Сегмент: ${window.biathlonGame.player.completedSegments}/${race.totalSegments}\n`;
        message += `🏅 Позиция: ${window.biathlonGame.player.position}\n`;
        message += `💪 Выносливость: ${Math.round(window.biathlonGame.player.stamina)}%\n`;
        message += `❤️ Пульс: ${Math.round(window.biathlonGame.player.pulse)}\n`;
        message += `⏱️ Общее время: ${this.formatTime(window.biathlonGame.player.totalGameTime)}\n\n`;
        
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
            'startStageScreen'
        ];
        
        stageScreens.forEach(screenId => {
            this.hideStageScreen(screenId);
        });
    }
    
    showStartStage() {
        if (!window.biathlonGame) return;
        
        const race = window.biathlonGame.getSelectedRace();
        const location = window.biathlonGame.getCurrentLocation();
        
        this.updateElement('startRaceName', `${race.name} - ${race.distance}`);
        this.updateElement('startDistance', race.distance);
        this.updateElement('startShootings', race.shootingRounds.length);
        this.updateElement('startPosition', window.biathlonGame.player.position);
        this.updateElement('startStamina', Math.round(window.biathlonGame.player.stamina) + '%');
        
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
        const totalSegmentsInLap = race.segmentsPerLap + (player.extraSegmentsPerLap[player.currentLap] || 0);
        this.updateElement('totalSegmentsPerLap', totalSegmentsInLap);
        
        // Обновляем физиологические показатели
        this.updateElement('pulseValue', Math.round(player.pulse));
        this.updateElement('staminaValue', Math.round(player.stamina) + '%');
        
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
        
        competitorsList.innerHTML = window.biathlonGame.allCompetitors.map(competitor => {
            const gap = competitor.totalGameTime - leader.totalGameTime;
            const shortName = this.formatShortName(competitor.name);
            const penaltyValue = window.biathlonGame.getPenaltyDisplayValue(competitor);
            
            if (competitor.isShooting) {
                return this.createShootingRow(competitor, shortName, gap, penaltyValue);
            } else {
                return this.createNormalRow(competitor, shortName, gap, penaltyValue);
            }
        }).join('');
    }

    createNormalRow(competitor, shortName, gap, penaltyValue) {
        // Добавляем отображение уровня для ботов
        const levelInfo = !competitor.isPlayer ? 
            `<div style="font-size: 9px; color: #888; margin-top: 2px;">Ур. ${competitor.level}</div>` : '';
        
        return `
            <div class="compact-row ${competitor.isPlayer ? 'player' : ''}">
                <div class="position">${competitor.position}</div>
                <div class="flag">${competitor.flag}</div>
                <div class="name">
                    ${shortName}
                    ${levelInfo}
                </div>
                <div class="gap">+${this.formatTime(gap)}</div>
                <div class="penalty">${penaltyValue > 0 ? penaltyValue : ''}</div>
            </div>
        `;
    }

    createShootingRow(competitor, shortName, gap, penaltyValue) {
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
                    ${shortName}
                    ${levelInfo}
                </div>
                <div class="targets-container">
                    ${targetsHTML}
                </div>
                <div class="penalty">${penaltyValue > 0 ? penaltyValue : ''}</div>
            </div>
        `;
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
