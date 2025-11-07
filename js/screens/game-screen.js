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
        
        const race = window.biathlonGame.getCurrentRace();
        
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
        
        const shootingRound = window.biathlonGame.currentShootingRound;
        const results = window.biathlonGame.getShootingResults(window.biathlonGame.player);
        
        this.updateElement('postShootingSubtitle', shootingRound.name + ' завершена');
        this.updateElement('postShootingHits', `${results.hits}/5`);
        this.updateElement('postShootingMisses', results.misses);
        this.updateElement('postShootingPenalty', `+${results.misses * 10} сек`);
        
        this.updateShootingTargetsPreview(results);
        
        this.showStageScreen('postShootingScreen');
    }
    
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
        
        const currentLap = window.biathlonGame.getCurrentLap();
        const currentSegmentInLap = window.biathlonGame.getCurrentSegmentInLap();
        
        this.updateElement('currentLap', currentLap);
        this.updateElement('totalLaps', race.totalLaps);
        this.updateElement('currentSegmentInLap', currentSegmentInLap);
        this.updateElement('totalSegmentsPerLap', race.segmentsPerLap);
        
        this.updateElement('pulseValue', Math.round(window.biathlonGame.player.pulse));
        this.updateElement('staminaValue', Math.round(window.biathlonGame.player.stamina) + '%');
        
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
        
        competitorsList.innerHTML = window.biathlonGame.allCompetitors.map(competitor => {
            const gap = competitor.time - leader.time;
            const shortName = this.formatShortName(competitor.name);
            
            if (isShooting) {
                const shootingResults = window.biathlonGame.getShootingResults(competitor);
                return this.createShootingRow(competitor, shortName, shootingResults, gap);
            } else {
                return this.createNormalRow(competitor, shortName, gap);
            }
        }).join('');
    }
    
    class GameScreen {
    // [остальной код без изменений...]

    createNormalRow(competitor, shortName, gap) {
        // Отображаем уровень для всех участников
        const levelDisplay = competitor.isPlayer ? 
            `Lv.${competitor.level || 0}` : 
            `Lv.${competitor.level}`;

        return `
            <div class="compact-row ${competitor.isPlayer ? 'player' : ''}">
                <div class="position">${competitor.position}</div>
                <div class="flag">${competitor.flag}</div>
                <div class="name">${shortName} <span style="color: #4FC3F7; font-size: 10px;">${levelDisplay}</span></div>
                <div class="gap">+${this.formatTime(gap)}</div>
            </div>
        `;
    }

    createShootingRow(competitor, shortName, shootingResults, gap) {
        let targetsHTML = '<div class="targets-inline">';
        
        if (shootingResults) {
            for (let i = 0; i < 5; i++) {
                let targetClass = 'inline-target';
                if (shootingResults.shots[i] !== null) {
                    targetClass += shootingResults.shots[i] ? ' hit' : ' miss';
                }
                targetsHTML += `<div class="${targetClass}"></div>`;
            }
        } else {
            for (let i = 0; i < 5; i++) {
                targetsHTML += '<div class="inline-target"></div>';
            }
        }
        
        targetsHTML += '</div>';

        // Отображаем уровень для всех участников
        const levelDisplay = competitor.isPlayer ? 
            `Lv.${competitor.level || 0}` : 
            `Lv.${competitor.level}`;

        return `
            <div class="compact-row ${competitor.isPlayer ? 'player' : ''}">
                <div class="position">${competitor.position}</div>
                <div class="flag">${competitor.flag}</div>
                <div class="name">${shortName} <span style="color: #4FC3F7; font-size: 10px;">${levelDisplay}</span></div>
                <div class="targets-container">
                    ${targetsHTML}
                </div>
            </div>
        `;
    }

    // [остальной код без изменений...]
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
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
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
