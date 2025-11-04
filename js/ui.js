class GameUI {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'mainMenu';
        
        // Даем время на загрузку DOM перед настройкой событий
        setTimeout(() => {
            this.setupMenuEventListeners();
            this.setupGameEventListeners();
        }, 200);
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
        } else {
            console.error(`Экран ${screenId} не найден`);
        }
    }

    // Настройка обработчиков меню
    setupMenuEventListeners() {
        console.log("Настройка обработчиков меню...");
        
        // Выбор гонки
        const raceCards = document.querySelectorAll('.race-card');
        if (raceCards.length > 0) {
            raceCards.forEach(card => {
                card.addEventListener('click', () => {
                    this.handleRaceCardClick(card);
                });
            });
            console.log(`Найдено карточек гонок: ${raceCards.length}`);
        } else {
            console.warn("Карточки гонок не найдены");
        }

        // Кнопка "Начать гонку"
        const startBtn = document.getElementById('startRace');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.handleStartRace();
            });
            console.log("Кнопка 'Начать гонку' настроена");
        } else {
            console.warn("Кнопка 'Начать гонку' не найдена");
        }

        // Кнопка "Настройки"
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                alert('Раздел настроек в разработке!');
            });
        }

        // Кнопка "Статистика"
        const statsBtn = document.getElementById('statsBtn');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                alert('Раздел статистики в разработке!');
            });
        }
        
        console.log("Обработчики меню настроены");
    }

    // Настройка обработчиков игры
    setupGameEventListeners() {
        console.log("Настройка обработчиков игры...");
        
        // Кнопки управления во время гонки
        const sprintBtn = document.getElementById('sprintBtn');
        if (sprintBtn) {
            sprintBtn.addEventListener('click', () => {
                this.handleSprint();
            });
            console.log("Кнопка спринта настроена");
        }

        const slowBtn = document.getElementById('slowBtn');
        if (slowBtn) {
            slowBtn.addEventListener('click', () => {
                this.handleSlowPace();
            });
            console.log("Кнопка замедления настроена");
        }

        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.showGameMenu();
            });
            console.log("Кнопка меню игры настроена");
        }
        
        console.log("Обработчики игры настроены");
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
        
        console.log(`Выбрана гонка: ${this.game.getSelectedRace().name}`);
    }

    handleStartRace() {
        console.log("Нажата кнопка 'Начать гонку'");
        
        const selectedRace = this.game.getSelectedRace();
        console.log("Выбранная гонка:", selectedRace);
        
        if (selectedRace) {
            console.log(`Запуск гонки: ${selectedRace.name}`);
            this.startGame();
        } else {
            console.log("Гонка не выбрана!");
            alert('Пожалуйста, выберите тип гонки!');
        }
    }

    // Запуск игры
    startGame() {
        // Останавливаем любую текущую гонку
        if (this.game.isRacing) {
            this.game.returnToMenu();
        }
        
        // Запускаем новую гонку
        const success = this.game.startRace();
        console.log("Гонка запущена:", success);
        
        if (success) {
            // Переключаем экран
            this.showScreen('gameScreen');
            this.updateDisplay();
            console.log("Экран переключен на gameScreen");
        }
    }

    // Обработчики кнопок игры
    handleSprint() {
        console.log("Нажата кнопка спринта");
        const success = this.game.activateSprint();
        if (!success) {
            alert("Недостаточно выносливость для спринта!");
        } else {
            this.showSprintEffect();
        }
        this.updateDisplay();
    }

    handleSlowPace() {
        console.log("Нажата кнопка замедления");
        this.game.activateSlowPace();
        this.showSlowEffect();
        this.updateDisplay();
    }

    showGameMenu() {
        const race = this.game.getCurrentRace();
        let message = `🏁 ${race.name}\n`;
        message += `📊 Сегмент: ${this.game.currentSegment}/${race.totalSegments}\n`;
        message += `🏅 Позиция: ${this.game.player.position}\n`;
        message += `💪 Выносливость: ${Math.round(this.game.player.stamina)}%\n`;
        message += `❤️ Пульс: ${Math.round(this.game.player.pulse)}`;
        
        alert(message);
    }

    // Обновление дисплея во время гонки
    updateDisplay() {
        if (this.currentScreen !== 'gameScreen') return;

        const race = this.game.getCurrentRace();
        
        // Обновляем верхнюю панель
        const currentSegmentEl = document.getElementById('currentSegment');
        const totalSegmentsEl = document.getElementById('totalSegments');
        
        if (currentSegmentEl) currentSegmentEl.textContent = this.game.currentSegment;
        if (totalSegmentsEl) totalSegmentsEl.textContent = race.totalSegments;
        
        // Обновляем индикаторы
        this.updateIndicators();
        
        // Обновляем таблицу лидеров
        this.updateCompetitorsList();
    }

    updateIndicators() {
        const pulseValueEl = document.getElementById('pulseValue');
        const staminaValueEl = document.getElementById('staminaValue');
        
        if (pulseValueEl) pulseValueEl.textContent = Math.round(this.game.player.pulse);
        if (staminaValueEl) staminaValueEl.textContent = Math.round(this.game.player.stamina) + '%';
    }

    updateCompetitorsList() {
        const competitorsList = document.getElementById('competitorsList');
        const leader = this.game.allCompetitors[0];
        
        if (!competitorsList) {
            console.error("Элемент competitorsList не найден");
            return;
        }
        
        competitorsList.innerHTML = this.game.allCompetitors.map(competitor => {
            const gap = competitor.time - leader.time;
            
            // Форматируем имя: Фамилия + первая буква имени
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
        // Берем только фамилию (первое слово) и первую букву имени
        const parts = fullName.split(' ');
        if (parts.length >= 2) {
            return parts[0] + ' ' + parts[1].charAt(0) + '.';
        }
        return fullName; // Если только одно слово
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
    }

    // Анимации и эффекты
    showSprintEffect() {
        const btn = document.getElementById('sprintBtn');
        if (btn) {
            btn.style.transform = 'scale(0.9)';
            btn.style.background = 'linear-gradient(135deg, #FF1744, #D50000)';
            
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
                btn.style.background = 'linear-gradient(135deg, #FF5252, #FF1744)';
            }, 300);
        }
    }

    showSlowEffect() {
        const btn = document.getElementById('slowBtn');
        if (btn) {
            btn.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 300);
        }
    }
}