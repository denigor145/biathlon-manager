class GameUI {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'mainMenu';
        this.setupMenuEventListeners();
    }

    // Управление экранами
    showScreen(screenId) {
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Показываем нужный экран
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    // Настройка обработчиков меню
    setupMenuEventListeners() {
        // Выбор гонки
        document.querySelectorAll('.race-card').forEach(card => {
            card.addEventListener('click', () => {
                // Убираем выделение у всех карточек
                document.querySelectorAll('.race-card').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Выделяем выбранную карточку
                card.classList.add('selected');
                
                const raceType = card.getAttribute('data-race');
                this.game.selectRaceType(raceType);
                
                console.log(`Выбрана гонка: ${this.game.getSelectedRace().name}`);
            });
        });

        // Кнопка "Начать гонку"
        document.getElementById('startRace').addEventListener('click', () => {
            const selectedRace = this.game.getSelectedRace();
            if (selectedRace) {
                console.log(`Запуск гонки: ${selectedRace.name}`);
                this.startGame();
            } else {
                alert('Пожалуйста, выберите тип гонки!');
            }
        });

        // Кнопка "Настройки"
        document.getElementById('settingsBtn').addEventListener('click', () => {
            alert('Раздел настроек в разработке!');
        });

        // Кнопка "Статистика"
        document.getElementById('statsBtn').addEventListener('click', () => {
            alert('Раздел статистики в разработке!');
        });

        // Кнопка возврата в меню
        document.getElementById('backToMenu').addEventListener('click', () => {
            this.returnToMenu();
        });
    }

    // Запуск игры
startGame() {
    console.log("Нажата кнопка 'Начать гонку'");
    
    const selectedRace = this.game.getSelectedRace();
    console.log("Выбранная гонка:", selectedRace);
    
    if (selectedRace) {
        console.log(`Запуск гонки: ${selectedRace.name}`);
        
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
    } else {
        console.log("Гонка не выбрана!");
        alert('Пожалуйста, выберите тип гонки!');
    }
}

    // Возврат в меню
    returnToMenu() {
        this.game.returnToMenu();
        this.showScreen('mainMenu');
    }

    // Обновление дисплея во время гонки
    updateDisplay() {
        if (this.currentScreen !== 'gameScreen') return;

        const race = this.game.getCurrentRace();
        
        // Обновляем верхнюю панель
        document.getElementById('currentSegment').textContent = this.game.currentSegment;
        document.getElementById('totalSegments').textContent = race.totalSegments;
        document.getElementById('raceTime').textContent = this.formatTime(this.game.totalTime);
        
        // Обновляем индикаторы
        this.updateIndicators();
        
        // Обновляем таблицу лидеров
        this.updateLeaderboard();

        // Обновляем информацию о текущем этапе
        this.updateStageInfo();
    }

    updateIndicators() {
        document.getElementById('pulseValue').textContent = Math.round(this.game.player.pulse);
        document.getElementById('staminaValue').textContent = Math.round(this.game.player.stamina) + '%';
        
        document.getElementById('pulseFill').style.width = ((this.game.player.pulse - 60) / 120 * 100) + '%';
        document.getElementById('staminaFill').style.width = this.game.player.stamina + '%';
    }

    updateStageInfo() {
        const race = this.game.getCurrentRace();
        const currentSegment = this.game.currentSegment;
        
        // Определяем текущий этап
        let stageInfo = "Гонка";
        let nextEvent = "";

        if (this.game.isShooting) {
            stageInfo = this.game.currentShootingRound.name;
        } else {
            // Проверяем, какая стрельба будет следующей
            const nextShooting = race.shootingRounds.find(round => 
                round.afterSegment > currentSegment
            );
            
            if (nextShooting) {
                const segmentsToShooting = nextShooting.afterSegment - currentSegment;
                nextEvent = `Стрельба через ${segmentsToShooting} сегментов`;
            } else if (currentSegment >= race.totalSegments - 5) {
                nextEvent = "ФИНИШ близко!";
            }
        }

        // Можно добавить отображение этой информации в интерфейсе
        console.log(`Этап: ${stageInfo} | ${nextEvent}`);
    }

    updateLeaderboard() {
        const leader = this.game.allCompetitors[0];
        
        // Обновляем плакат лидера
        document.getElementById('leaderPoster').innerHTML = `
            <div class="leader-flag">${leader.flag}</div>
            <div class="leader-name">${leader.name}</div>
            <div class="leader-time">${this.formatTime(leader.time)}</div>
            <div class="leader-stats">
                <div class="stat">Скорость: ${leader.speed.toFixed(1)}</div>
                <div class="stat">Выносливость: ${Math.round(leader.stamina)}%</div>
            </div>
        `;
        
        // Обновляем список (показываем игрока и ближайших соперников)
        this.updateCompetitorsList();
    }

    updateCompetitorsList() {
        const playerIndex = this.game.allCompetitors.findIndex(c => c.isPlayer);
        const startIndex = Math.max(0, playerIndex - 2);
        const endIndex = Math.min(this.game.allCompetitors.length, playerIndex + 5);
        
        const visibleCompetitors = this.game.allCompetitors.slice(startIndex, endIndex);
        const competitorsList = document.getElementById('competitorsList');
        const leader = this.game.allCompetitors[0];
        
        competitorsList.innerHTML = visibleCompetitors.map(competitor => {
            const gap = competitor.time - leader.time;
            const timeDiff = competitor.time - this.game.allCompetitors[Math.max(0, competitor.position - 2)]?.time || 0;
            
            return `
                <div class="competitor-row ${competitor.isPlayer ? 'player' : ''}">
                    <div class="competitor-position">${competitor.position}</div>
                    <div class="competitor-flag">${competitor.flag}</div>
                    <div class="competitor-name">${competitor.name}</div>
                    <div class="competitor-time">${this.formatTime(competitor.time)}</div>
                    <div class="competitor-gap">+${this.formatTime(gap)}</div>
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Кнопки управления во время гонки
        document.getElementById('sprintBtn').addEventListener('click', () => {
            const success = this.game.activateSprint();
            if (!success) {
                alert("Недостаточно выносливости для спринта!");
            }
            this.updateDisplay();
        });
        
        document.getElementById('slowBtn').addEventListener('click', () => {
            this.game.activateSlowPace();
            this.updateDisplay();
        });
        
        document.getElementById('menuBtn').addEventListener('click', () => {
            const race = this.game.getCurrentRace();
            let message = `Гонка: ${race.name}\n`;
            message += `Сегмент: ${this.game.currentSegment}/${race.totalSegments}\n`;
            message += `Позиция: ${this.game.player.position}\n`;
            message += `Выносливость: ${Math.round(this.game.player.stamina)}%`;
            
            alert(message);
        });
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
    }

    // Анимации и эффекты
    showSprintEffect() {
        const btn = document.getElementById('sprintBtn');
        btn.style.transform = 'scale(0.9)';
        btn.style.background = 'linear-gradient(135deg, #FF1744, #D50000)';
        
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
            btn.style.background = 'linear-gradient(135deg, #FF5252, #FF1744)';
        }, 300);
    }

    showSlowEffect() {
        const btn = document.getElementById('slowBtn');
        btn.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 300);
    }
}