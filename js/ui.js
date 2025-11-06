class GameUI {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'mainMenu';
        
        console.log("GameUI создан!");
        
        // Даем время на загрузку DOM
        setTimeout(() => {
            this.setupMenuEventListeners();
            this.setupGameEventListeners();
            this.setupStageEventListeners();
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

    // Настройка обработчиков этапов
    setupStageEventListeners() {
        console.log("Настройка обработчиков этапов...");
        
        // Кнопка старта гонки
        const startStageBtn = document.getElementById('startRaceStageBtn');
        if (startStageBtn) {
            startStageBtn.addEventListener('click', () => {
                this.hideStageScreen('startStageScreen');
                this.game.startRaceAfterStage();
            });
        }

        // Кнопка начала стрельбы
        const startShootingBtn = document.getElementById('startShootingBtn');
        if (startShootingBtn) {
            startShootingBtn.addEventListener('click', () => {
                this.hideStageScreen('preShootingScreen');
                this.game.startShootingAfterStage();
            });
        }

        // Кнопка продолжения после стрельбы
        const continueShootingBtn = document.getElementById('continueAfterShootingBtn');
        if (continueShootingBtn) {
            continueShootingBtn.addEventListener('click', () => {
                this.hideStageScreen('postShootingScreen');
                this.game.continueAfterShooting();
            });
        }
    }

    // Показать экран старта гонки
    showStartStage() {
        const race = this.game.getSelectedRace();
        
        // Заполняем информацию о гонке
        this.updateElement('startRaceName', `${race.name} - ${race.distance}`);
        this.updateElement('startDistance', race.distance);
        this.updateElement('startShootings', race.shootingRounds.length);
        this.updateElement('startPosition', this.game.player.position);
        this.updateElement('startStamina', Math.round(this.game.player.stamina) + '%');
        
        // Показываем экран
        this.showStageScreen('startStageScreen');
    }

    // Показать экран перед стрельбой
    showPreShootingStage(shootingRound) {
        const race = this.game.getCurrentRace();
        const currentLap = this.game.getCurrentLap();
        
        // Заполняем информацию о стрельбе
        this.updateElement('preShootingTitle', `🎯 ${shootingRound.name}`);
        this.updateElement('preShootingPosition', this.game.player.position);
        this.updateElement('preShootingGap', '+' + this.formatTime(this.game.getPlayerGap()));
        
        // Точность стрельбы в зависимости от положения
        const accuracy = this.game.player.shooting[shootingRound.position] * 100;
        this.updateElement('preShootingAccuracy', Math.round(accuracy) + '%');
        
        // Случайный ветер
        const wind = this.game.getRandomWind();
        this.updateElement('preShootingWind', wind);
        
        // Показываем экран
        this.showStageScreen('preShootingScreen');
    }

    // Показать экран после стрельбы
    showPostShootingStage() {
        const shootingRound = this.game.currentShootingRound;
        const results = this.game.getShootingResults(this.game.player);
        
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

    // Показать стрельбу в процессе
    showShootingInProgress() {
        // Сначала скрываем все экраны этапов
        this.hideAllStageScreens();
        
        // Показываем основной экран гонки
        this.showScreen('gameScreen');
        
        // Обновляем отображение
        this.updateDisplay();
        
        // Показываем элементы стрельбы с небольшой задержкой для плавности
        setTimeout(() => {
            const targets = document.querySelectorAll('.targets-inline');
            const statusTexts = document.querySelectorAll('.shooting-status-text');
            const gaps = document.querySelectorAll('.gap');
            
            targets.forEach(target => target.classList.add('visible'));
            statusTexts.forEach(status => status.classList.add('visible'));
            gaps.forEach(gap => gap.classList.add('hidden'));
        }, 50);
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
        
        // Запускаем гонку (она покажет стартовый экран)
        const success = this.game.startRace();
        console.log("Race started:", success);
        
        if (success) {
            this.showScreen('gameScreen');
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

    // Обновить шаг стрельбы
    updateShootingStep(step) {
        this.updateDisplay();
    }

    // Показать результаты стрельбы
    showShootingResults() {
        this.updateDisplay();
    }

    // Скрыть стрельбу (вернуть нормальное отображение)
    hideShooting() {
        const targets = document.querySelectorAll('.targets-inline');
        const statusTexts = document.querySelectorAll('.shooting-status-text');
        const gaps = document.querySelectorAll('.gap');
        
        targets.forEach(target => target.classList.remove('visible'));
        statusTexts.forEach(status => status.classList.remove('visible'));
        gaps.forEach(gap => gap.classList.remove('hidden'));
        
        // Немедленно обновляем отображение
        this.updateDisplay();
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
        const isShooting = this.game.isShootingInProgress();
        const shootingStep = this.game.getShootingStep();
        
        competitorsList.innerHTML = this.game.allCompetitors.map(competitor => {
            const gap = competitor.time - leader.time;
            const shortName = this.formatShortName(competitor.name);
            
            if (isShooting) {
                const shootingResults = this.game.getShootingResults(competitor);
                return this.createShootingRow(competitor, shortName, shootingResults, shootingStep, gap);
            } else {
                return `
                    <div class="compact-row ${competitor.isPlayer ? 'player' : ''}">
                        <div class="position">${competitor.position}</div>
                        <div class="flag">${competitor.flag}</div>
                        <div class="name">${shortName}</div>
                        <div class="gap">+${this.formatTime(gap)}</div>
                    </div>
                `;
            }
        }).join('');
    }

    createShootingRow(competitor, shortName, shootingResults, shootingStep, gap) {
        let targetsHTML = '';
        let statusText = '';

        if (shootingStep === 0) {
            statusText = 'Ожидание...';
            targetsHTML = `
                <div class="targets-inline">
                    <div class="inline-target pending"></div>
                    <div class="inline-target pending"></div>
                    <div class="inline-target pending"></div>
                    <div class="inline-target pending"></div>
                    <div class="inline-target pending"></div>
                </div>
            `;
        } else if (shootingStep <= 5) {
            statusText = `Выстрел ${shootingStep}/5`;
            targetsHTML = `<div class="targets-inline visible">`;
            
            for (let i = 0; i < 5; i++) {
                if (i < shootingStep - 1) {
                    const isHit = shootingResults.shots[i];
                    targetsHTML += `<div class="inline-target ${isHit ? 'hit' : 'miss'}"></div>`;
                } else if (i === shootingStep - 1) {
                    targetsHTML += `<div class="inline-target pending"></div>`;
                } else {
                    targetsHTML += `<div class="inline-target"></div>`;
                }
            }
            targetsHTML += '</div>';
        } else {
            const hits = shootingResults.hits;
            const misses = shootingResults.misses;
            statusText = `${hits}/5 (+${misses * 10}с)`;
            
            targetsHTML = '<div class="targets-inline visible">';
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
                ${targetsHTML}
                <div class="shooting-status-text ${shootingStep > 0 ? 'visible' : ''}">${statusText}</div>
                <div class="gap ${shootingStep > 0 ? 'hidden' : ''}">+${this.formatTime(gap)}</div>
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
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
    }
}
