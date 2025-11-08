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
            this.showScreen('gameScreen');
        }
    }
    
    handleContinueAfterShooting() {
        console.log("Continuing after shooting");
        if (window.biathlonGame) {
            window.biathlonGame.continueAfterShooting();
            this.hideStageScreen('postShootingScreen');
            this.showScreen('gameScreen');
        }
    }
    
    showGameMenu() {
        if (!window.biathlonGame) return;
        
        const race = window.biathlonGame.getCurrentRace();
        let message = `🏁 ${race.name}\n`;
        message += `📊 Сегмент: ${window.biathlonGame.player.completedSegments}/${race.totalSegments}\n`;
        message += `🏅 Позиция: ${window.biathlonGame.player.position}\n`;
        message += `💪 Выносливость: ${Math.round(window.biathlonGame.player.stamina)}%\n`;
        message += `❤️ Пульс: ${Math.round(window.biathlonGame.player.pulse)}\n`;
        message += `⏱️ Общее время: ${this.formatTime(window.biathlonGame.player.totalGameTime)}\n\n`;
        
        if (window.playerProfile) {
            const stats = window.playerProfile.getAllStats();
            message += `📈 Характеристики:\n`;
            message += `🏃 Скорость: ${window.playerProfile.getFormattedStat('runningSpeed')}\n`;
            message += `🎯 Меткость: ${window.playerProfile.getFormattedStat('accuracy')}\n`;
            message += `⚡ Стрельба: ${window.playerProfile.getFormattedStat('shootingSpeed')}\n`;
            message += `💪 Выносливость: ${window.playerProfile.getFormattedStat('stamina')}`;
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
        
        this.updateElement('startRaceName', `${race.name} - ${race.distance}`);
        this.updateElement('startDistance', race.distance);
        this.updateElement('startShootings', race.shootingRounds.length);
        this.updateElement('startPosition', window.biathlonGame.player.position);
        this.updateElement('startStamina', Math.round(window.biathlonGame.player.stamina) + '%');
        
        this.showStageScreen('startStageScreen');
    }
    
    showPreShootingStage(shootingRound) {
        if (!window.biathlonGame) return;
        
        this.updateElement('preShootingTitle', `🎯 ${shootingRound.name}`);
        this.updateElement('preShootingPosition', window.biathlonGame.player.position);
        this.updateElement('preShootingGap', '+' + this.formatTime(window.biathlonGame.getPlayerGap()));
        
        const accuracy = window.biathlonGame.player.shooting[shootingRound.position] * 100;
        this.updateElement('preShootingAccuracy', Math.round(accuracy) + '%');
        
        const wind = window.biathlonGame.getRandomWind();
        this.updateElement('preShootingWind', wind);
        
        this.showStageScreen('preShootingScreen');
    }
    
    showPostShootingStage() {
        if (!window.biathlonGame) return;
        
        const player = window.biathlonGame.player;
        const results = window.biathlonGame.getShootingResults(player);
        
        this.updateElement('postShootingSubtitle', 'Стрельба завершена');
        this.updateElement('postShootingHits', `${results.hits}/5`);
        this.updateElement('postShootingMisses', results.misses);
        
        // Определяем штраф в зависимости от типа гонки
        if (window.biathlonGame.currentRaceType === 'individual') {
            this.updateElement('postShootingPenalty', `+${results.misses} мин штрафа`);
        } else {
            this.updateElement('postShootingPenalty', `+${results.misses} отрезков в след. круге`);
        }
        
        this.updateShootingTargetsPreview(results);
        
        this.showStageScreen('postShootingScreen');
    }
    
    updateShootingTargetsPreview(results) {
        const container = document.getElementById('postShootingTargets');
        if (!container) return;
        
        container.innerHTML = '';
        container.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 15px 0;
        `;
        
        for (let i = 0; i < 5; i++) {
            const target = document.createElement('div');
            target.className = 'preview-target';
            target.style.cssText = `
                width: 25px;
                height: 25px;
                background: white;
                border-radius: 50%;
                border: 2px solid #333;
                position: relative;
            `;
            
            if (results.shots[i] !== null) {
                if (results.shots[i]) {
                    target.classList.add('hit');
                    target.style.cssText += `
                        background: white;
                    `;
                    target.innerHTML = `<div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 15px;
                        height: 15px;
                        background: black;
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                    "></div>`;
                } else {
                    target.classList.add('miss');
                    target.style.cssText += `
                        background: #e74c3c;
                    `;
                }
            }
            
            container.appendChild(target);
        }
    }
    
    showShootingInProgress() {
        this.hideAllStageScreens();
        this.showScreen('gameScreen');
        this.updateDisplay();
    }
    
    hideShooting() {
        this.updateDisplay();
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
        
        // Обновляем информацию о стрельбе, если она идет
        this.updateShootingInfo();
    }
    
    updateShootingInfo() {
        if (!window.biathlonGame) return;
        
        const shootingCompetitors = window.biathlonGame.allCompetitors.filter(c => c.isShooting);
        
        if (shootingCompetitors.length > 0) {
            // Показываем информацию о стрельбе
            const shootingContainer = document.getElementById('shootingScreen');
            if (shootingContainer) {
                shootingContainer.style.display = 'block';
                
                // Обновляем информацию о текущей стрельбе
                shootingCompetitors.forEach(competitor => {
                    if (competitor.isPlayer) {
                        const elapsedTime = ((Date.now() - competitor.shootingStartTime) / 1000).toFixed(1);
                        this.updateElement('shootingRoundName', competitor.currentShooting?.name || 'Стрельба');
                        this.updateElement('shootingTimer', `Время: ${elapsedTime}с`);
                        
                        // Прогресс стрельбы
                        const progress = (competitor.shotsFired / 5) * 100;
                        const progressFill = document.getElementById('shootingProgress');
                        const progressText = document.getElementById('shootingProgressText');
                        
                        if (progressFill) {
                            progressFill.style.width = progress + '%';
                        }
                        if (progressText) {
                            progressText.textContent = `${competitor.shotsFired}/5 выстрелов`;
                        }
                    }
                });
            }
        } else {
            // Скрываем информацию о стрельбе
            const shootingContainer = document.getElementById('shootingScreen');
            if (shootingContainer) {
                shootingContainer.style.display = 'none';
            }
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
            
            if (competitor.isShooting) {
                return this.createShootingRow(competitor, shortName, gap);
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

    createShootingRow(competitor, shortName, gap) {
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

        return `
            <div class="compact-row ${competitor.isPlayer ? 'player' : 'shooting'}">
                <div class="position">${competitor.position}</div>
                <div class="flag">${competitor.flag}</div>
                <div class="name">${shortName}</div>
                <div class="targets-container">
                    ${targetsHTML}
                </div>
            </div>
        `;
    }
 
    updateShootingStep(step) {
        this.updateDisplay();
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
