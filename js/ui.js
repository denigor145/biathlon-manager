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

    // Управление экраном стрельбы всех участников
    showShootingScreen(shootingRound, competitors) {
        const shootingScreen = document.getElementById('shootingScreen');
        const roundName = document.getElementById('shootingRoundName');
        const timerElement = document.getElementById('shootingTimer');
        
        if (shootingScreen && roundName && timerElement) {
            roundName.textContent = shootingRound.name;
            timerElement.textContent = "Стрельба началась...";
            shootingScreen.classList.add('active');
            
            // Создаем список участников с мишенями
            this.createShootingCompetitorsList(competitors);
            
            // Сбрасываем прогресс
            this.updateShootingProgress(0, "Ожидание начала стрельбы...");
            
            console.log("Экран стрельбы показан");
        } else {
            console.error("Элементы стрельбы не найдены!");
        }
    }

    createShootingCompetitorsList(competitors) {
        const container = document.getElementById('shootingCompetitors');
        if (!container) return;
        
        container.innerHTML = competitors.map((competitor, index) => {
            return `
                <div class="shooting-competitor" id="shooter-${index}">
                    <div class="competitor-info">
                        <div class="competitor-position">${competitor.position}</div>
                        <div class="competitor-flag">${competitor.flag}</div>
                        <div class="competitor-name">${competitor.name}</div>
                    </div>
                    <div class="competitor-targets">
                        <div class="competitor-target" id="target-${index}-0"></div>
                        <div class="competitor-target" id="target-${index}-1"></div>
                        <div class="competitor-target" id="target-${index}-2"></div>
                        <div class="competitor-target" id="target-${index}-3"></div>
                        <div class="competitor-target" id="target-${index}-4"></div>
                    </div>
                    <div class="shooting-status waiting">Ожидание</div>
                </div>
            `;
        }).join('');
    }

    setCurrentShooter(shooterIndex, shooter) {
        // Сбрасываем активный класс у всех
        document.querySelectorAll('.shooting-competitor').forEach(el => {
            el.classList.remove('active');
        });
        
        // Устанавливаем активный класс текущему стрелку
        const currentShooter = document.getElementById(`shooter-${shooterIndex}`);
        if (currentShooter) {
            currentShooter.classList.add('active');
            
            // Обновляем статус
            const statusElement = currentShooter.querySelector('.shooting-status');
            if (statusElement) {
                statusElement.textContent = "Стреляет...";
                statusElement.className = "shooting-status shooting";
            }
        }
        
        // Обновляем прогресс
        const progress = (shooterIndex / this.game.allCompetitors.length) * 100;
        this.updateShootingProgress(progress, `Стреляет: ${shooter.name}`);
        
        console.log(`Текущий стрелок: ${shooter.name}`);
    }

    updateShooterTarget(shooter, targetIndex, isHit) {
        const shooterIndex = this.game.allCompetitors.indexOf(shooter);
        const targetElement = document.getElementById(`target-${shooterIndex}-${targetIndex}`);
        
        if (targetElement) {
            targetElement.className = "competitor-target";
            targetElement.classList.add(isHit ? 'hit' : 'miss');
            
            if (isHit) {
                targetElement.classList.add('current');
            }
        }
    }

    finishShooter(shooterIndex, shooter, results) {
        const shooterElement = document.getElementById(`shooter-${shooterIndex}`);
        if (shooterElement) {
            shooterElement.classList.remove('active');
            shooterElement.classList.add('finished');
            
            // Обновляем статус
            const statusElement = shooterElement.querySelector('.shooting-status');
            if (statusElement) {
                statusElement.textContent = `${results.hits}/5 (+${results.penaltyTime}с)`;
                statusElement.className = "shooting-status " + 
                    (results.misses > 0 ? "penalty" : "finished");
            }
        }
        
        // Обновляем прогресс
        const progress = ((shooterIndex + 1) / this.game.allCompetitors.length) * 100;
        this.updateShootingProgress(progress, `Завершил: ${shooter.name} (${results.hits}/5)`);
        
        console.log(`Завершил стрельбу: ${shooter.name}`);
    }

    updateShootingProgress(percent, text) {
        const progressFill = document.getElementById('shootingProgress');
        const progressText = document.getElementById('shootingProgressText');
        
        if (progressFill) progressFill.style.width = percent + '%';
        if (progressText) progressText.textContent = text;
    }

    hideShootingScreen() {
        const shootingScreen = document.getElementById('shootingScreen');
        if (shootingScreen) {
            shootingScreen.classList.remove('active');
            console.log("Экран стрельбы скрыт");
        }
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
