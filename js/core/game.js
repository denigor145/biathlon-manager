class BiathlonGame {
    constructor() {
        // Типы гонок
        this.raceTypes = {
            sprint: {
                name: "Спринт",
                distance: "3 км",
                trackLength: 150,
                totalLaps: 3,
                segmentsPerLap: 6,
                totalSegments: 18,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа" },
                    { afterLap: 2, position: "standing", name: "Стрельба стоя" }
                ],
                description: "Короткая быстрая гонка с 2 стрельбами"
            },
            pursuit: {
                name: "Гонка преследования", 
                distance: "5 км",
                trackLength: 150,
                totalLaps: 5,
                segmentsPerLap: 6,
                totalSegments: 30,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                    { afterLap: 2, position: "prone", name: "Стрельба лёжа 2" },
                    { afterLap: 3, position: "standing", name: "Стрельба стоя 1" },
                    { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
                ],
                description: "Средняя дистанция с 4 стрельбами"
            },
            individual: {
                name: "Индивидуальная гонка",
                distance: "6 км", 
                trackLength: 150,
                totalLaps: 4,
                segmentsPerLap: 10,
                totalSegments: 40,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                    { afterLap: 2, position: "prone", name: "Стрельба лёжа 2" },
                    { afterLap: 3, position: "standing", name: "Стрельба стоя 1" },
                    { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
                ],
                description: "Длинная дистанция с 4 стрельбами"
            }
        };

        // Текущее состояние игры
        this.selectedRaceType = "sprint";
        this.currentRaceType = "sprint";
        this.currentSegment = 1;
        this.totalTime = 0;
        this.isRacing = false;
        this.isShooting = false;
        this.currentShootingRound = null;
        this.raceInterval = null;
        this.shootingInterval = null;
        
        // Состояние стрельбы
        this.shootingStep = 0;
        this.allShootingResults = new Map();
        this.currentShootingIndex = 0;
        
        // Ветер (пока просто для отображения)
        this.windConditions = ["Слабый ветер", "Умеренный ветер", "Сильный ветер"];
        
        // Игрок (базовые значения, будут перезаписаны характеристиками)
        this.player = {
            name: "Вы",
            flag: "🎯",
            speed: 5,                    // Будет перезаписано характеристиками
            stamina: 100,                // Будет перезаписано характеристиками
            maxStamina: 100,             // Будет перезаписано характеристиками
            pulse: 120,
            position: 4,
            time: 18.3,
            isPlayer: true,
            shooting: {                  // Будет перезаписано характеристиками
                prone: 0.8,
                standing: 0.6
            },
            aggression: 0.7,
            consistency: 0.8,
            shootingSpeed: 2.0           // Будет перезаписано характеристиками
        };
        
        this.opponents = this.generateOpponents(15);
        this.allCompetitors = [this.player, ...this.opponents];
        
        console.log("Биатлон Менеджер инициализирован!");
    }
    
    generateOpponents(count) {
        const names = ["Йоханссон", "Мюллер", "Мартен", "Ларссон", "Хубер", "Бё", "Фуркад"];
        const flags = ["🇳🇴", "🇩🇪", "🇫🇷", "🇸🇪", "🇦🇹", "🇫🇮", "🇮🇹"];
        
        return Array.from({length: count}, (_, i) => {
            const baseSpeed = 4 + Math.random() * 3;
            const baseStamina = 80 + Math.random() * 20;
            
            return {
                name: names[i % names.length],
                flag: flags[i % flags.length],
                speed: baseSpeed,
                stamina: baseStamina,
                maxStamina: baseStamina,
                pulse: 110 + Math.random() * 30,
                position: i + 1,
                time: i * 2.5,
                isPlayer: false,
                shooting: {
                    prone: 0.6 + Math.random() * 0.3,
                    standing: 0.4 + Math.random() * 0.3
                },
                aggression: Math.random(),
                consistency: 0.7 + Math.random() * 0.3,
                shootingSpeed: 1.5 + Math.random() * 1.5  // Индивидуальная скорость стрельбы
            };
        });
    }
    
    // Расчет текущего круга
    getCurrentLap() {
        const race = this.getCurrentRace();
        return Math.ceil(this.currentSegment / race.segmentsPerLap);
    }

    getCurrentSegmentInLap() {
        const race = this.getCurrentRace();
        return this.currentSegment % race.segmentsPerLap || race.segmentsPerLap;
    }
    
    selectRaceType(raceType) {
        if (this.raceTypes[raceType]) {
            this.selectedRaceType = raceType;
            console.log(`Выбрана гонка: ${this.raceTypes[raceType].name}`);
            return true;
        }
        return false;
    }
    
    getSelectedRace() {
        return this.raceTypes[this.selectedRaceType];
    }
    
    getCurrentRace() {
        return this.raceTypes[this.currentRaceType];
    }
    
    getAllRaceTypes() {
        return this.raceTypes;
    }
    
    // Получить случайный ветер
    getRandomWind() {
        return this.windConditions[Math.floor(Math.random() * this.windConditions.length)];
    }
    
    // Применить характеристики игрока
    applyPlayerCharacteristics() {
        if (window.playerProfile && this.player) {
            window.playerProfile.applyToGamePlayer(this.player);
            console.log("Характеристики игрока применены:", this.player);
        }
    }
    
    // Запуск гонки
    startRace(raceType = null) {
        console.log("=== START RACE ===");
        
        if (raceType) {
            this.selectedRaceType = raceType;
        }
        
        this.currentRaceType = this.selectedRaceType;
        this.currentSegment = 1;
        this.totalTime = 0;
        this.isRacing = false; // Сначала показываем стартовый экран
        this.isShooting = false;
        this.currentShootingRound = null;
        this.shootingStep = 0;
        this.currentShootingIndex = 0;
        this.allShootingResults.clear();
        
        console.log("Параметры гонки установлены");
        console.log("Тип гонки:", this.currentRaceType);
        
        // Применяем характеристики игрока перед стартом
        this.applyPlayerCharacteristics();
        
        // Сбрасываем позиции всех участников
        this.allCompetitors.forEach((competitor, index) => {
            competitor.time = index * 0.5;
            competitor.position = index + 1;
            competitor.stamina = competitor.maxStamina;
            competitor.pulse = 120;
        });
        
        // Показываем стартовый экран
        if (window.gameScreen) {
            window.gameScreen.showStartStage();
        }
        
        return true;
    }

    // Начать гонку после стартового экрана
    startRaceAfterStage() {
        this.isRacing = true;
        this.startRaceInterval();
        console.log("Гонка началась!");
    }

    startRaceInterval() {
        this.raceInterval = setInterval(() => {
            this.updateRace();
        }, 2000);
    }
    
    updateRace() {
        if (this.isShooting) {
            console.log("Стрельба в процессе, пропускаем обновление гонки");
            return;
        }
        
        const race = this.getCurrentRace();
        
        console.log(`Сегмент: ${this.currentSegment}/${race.totalSegments}, Круг: ${this.getCurrentLap()}/${race.totalLaps}`);
        
        // Обновляем UI
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
        
        // Проверяем стрельбу в конце круга
        const currentLap = this.getCurrentLap();
        const isEndOfLap = this.currentSegment % race.segmentsPerLap === 0;
        
        console.log(`Проверка стрельбы: круг ${currentLap}, конец круга: ${isEndOfLap}`);
        
        const shootingRound = race.shootingRounds.find(round => 
            round.afterLap === currentLap && isEndOfLap
        );
        
        if (shootingRound && !this.isShooting) {
            console.log(`🚨 Найдена стрельба: ${shootingRound.name}`);
            this.prepareShooting(shootingRound);
            return;
        }
        
        if (this.currentSegment >= race.totalSegments) {
            this.finishRace();
            return;
        }
        
        // Обновляем позиции всех участников
        this.updateCompetitors();
        
        this.currentSegment++;
        this.totalTime += 2;
        
        console.log(`Переход к сегменту: ${this.currentSegment}`);
    }
    
    // Подготовка к стрельбе (показ экрана перед стрельбой)
    prepareShooting(shootingRound) {
        this.isShooting = true;
        this.currentShootingRound = shootingRound;
        
        // Останавливаем гонку на время стрельбы
        clearInterval(this.raceInterval);
        
        console.log(`🚨 Подготовка к стрельбе: ${shootingRound.name}`);
        
        // Показываем экран перед стрельбой
        if (window.gameScreen) {
            window.gameScreen.showPreShootingStage(shootingRound);
        }
    }
    
    // Начать стрельбу после экрана подготовки
    startShootingAfterStage() {
        console.log("🎯 Начало стрельбы после экрана подготовки");
        
        this.shootingStep = 0;
        
        // Инициализируем результаты стрельбы для всех участников
        this.allCompetitors.forEach(competitor => {
            this.allShootingResults.set(competitor, {
                hits: 0,
                misses: 0,
                shots: [null, null, null, null, null],
                finished: false
            });
        });
        
        // Обновляем UI для показа мишеней
        if (window.gameScreen) {
            window.gameScreen.showShootingInProgress();
        }
        
        // Начинаем стрельбу с учетом индивидуальной скорости
        this.startIndividualShooting();
    }
    
    // НОВЫЙ МЕТОД: Индивидуальная стрельба с разной скоростью
    startIndividualShooting() {
        this.shootingStep = 0;
        
        // Сбрасываем все таймеры стрельбы
        this.clearAllShootingTimers();
        
        // Запускаем стрельбу для каждого участника с его собственной скоростью
        this.allCompetitors.forEach(competitor => {
            this.startCompetitorShooting(competitor);
        });
        
        // Обновляем UI
        if (window.gameScreen) {
            window.gameScreen.updateShootingStep(this.shootingStep);
        }
    }
    
    // Запуск стрельбы для конкретного участника
    startCompetitorShooting(competitor) {
        const shootingSteps = [1, 2, 3, 4, 5];
        
        shootingSteps.forEach((step, index) => {
            // Рассчитываем время выстрела с учетом индивидуальной скорости и случайного разброса
            const baseTime = 3000; // 3 секунды базовое время
            const speedModifier = competitor.shootingSpeed;
            const randomVariation = (Math.random() - 0.5) * 1000; // ±0.5 секунды
            
            const shotTime = (baseTime / speedModifier) + randomVariation;
            
            // Запускаем таймер для этого выстрела
            competitor[`shotTimer${step}`] = setTimeout(() => {
                this.processCompetitorShot(competitor, index);
            }, shotTime * step); // Умножаем на step для последовательных выстрелов
        });
    }
    
    // Обработка выстрела конкретного участника
    processCompetitorShot(competitor, shotIndex) {
        const round = this.currentShootingRound;
        const accuracy = competitor.shooting[round.position];
        const effectiveAccuracy = accuracy * competitor.consistency;
        const isHit = Math.random() < effectiveAccuracy;
        
        const results = this.allShootingResults.get(competitor);
        results.shots[shotIndex] = isHit;
        
        if (isHit) {
            results.hits++;
        } else {
            results.misses++;
        }
        
        console.log(`${competitor.name}: выстрел ${shotIndex + 1} - ${isHit ? 'ПОПАДАНИЕ!' : 'ПРОМАХ'} (скорость: ${competitor.shootingSpeed.toFixed(1)})`);
        
        // Обновляем UI
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
        
        // Проверяем, все ли участники завершили стрельбу
        this.checkShootingCompletion();
    }
    
    // Проверка завершения стрельбы всеми участниками
    checkShootingCompletion() {
        let allFinished = true;
        
        for (const [competitor, results] of this.allShootingResults) {
            // Проверяем, есть ли еще не сделанные выстрелы
            const hasPendingShots = results.shots.some(shot => shot === null);
            if (hasPendingShots) {
                allFinished = false;
                break;
            }
        }
        
        if (allFinished) {
            console.log("🎯 ВСЕ УЧАСТНИКИ ЗАВЕРШИЛИ СТРЕЛЬБУ");
            this.finishShooting();
        }
    }
    
    // Очистка всех таймеров стрельбы
    clearAllShootingTimers() {
        this.allCompetitors.forEach(competitor => {
            for (let i = 1; i <= 5; i++) {
                const timerId = competitor[`shotTimer${i}`];
                if (timerId) {
                    clearTimeout(timerId);
                }
            }
        });
    }
    
    finishShooting() {
        // Очищаем все таймеры
        this.clearAllShootingTimers();
        
        console.log("🎯 ВСЕ УЧАСТНИКИ ЗАВЕРШИЛИ СТРЕЛЬБУ");
        
        // Добавляем штрафное время за промахи
        this.allCompetitors.forEach(competitor => {
            const results = this.allShootingResults.get(competitor);
            const penaltyTime = results.misses * 10;
            competitor.time += penaltyTime;
            results.finished = true;
            
            console.log(`${competitor.name}: ${results.hits}/5, штраф: +${penaltyTime}сек, скорость стрельбы: ${competitor.shootingSpeed.toFixed(1)}`);
        });
        
        // Показываем экран результатов стрельбы
        if (window.gameScreen) {
            window.gameScreen.showPostShootingStage();
        }
    }

    // Продолжить гонку после стрельбы
    continueAfterShooting() {
        console.log("Продолжение гонки после стрельбы");
        
        this.isShooting = false;
        this.currentShootingRound = null;
        this.currentShootingIndex++;
        
        // Скрываем UI стрельбы
        if (window.gameScreen) {
            window.gameScreen.hideShooting();
        }
        
        // Увеличиваем сегмент
        const race = this.getCurrentRace();
        if (this.currentSegment < race.totalSegments) {
            this.currentSegment++;
        }
        
        // Пересчитываем позиции после штрафного времени
        this.allCompetitors.sort((a, b) => a.time - b.time);
        this.allCompetitors.forEach((competitor, index) => {
            competitor.position = index + 1;
        });
        
        // Возобновляем гонку
        this.startRaceInterval();
        
        console.log(`Стрельба завершена, переходим к сегменту: ${this.currentSegment}`);
        
        // Проверяем не завершилась ли гонка
        if (this.currentSegment >= race.totalSegments) {
            this.finishRace();
        }
    }
    
    // Получить результаты стрельбы для участника
    getShootingResults(competitor) {
        return this.allShootingResults.get(competitor);
    }
    
    getShootingStep() {
        return this.shootingStep;
    }
    
    isShootingInProgress() {
        return this.isShooting;
    }
    
    // Получить отставание игрока от лидера
    getPlayerGap() {
        const leader = this.allCompetitors[0];
        return this.player.time - leader.time;
    }
    
    updateCompetitors() {
        this.allCompetitors.forEach(competitor => {
            if (!competitor.isPlayer) {
                const baseTimeChange = (10 / competitor.speed);
                const variation = (Math.random() * 0.4 - 0.2) * competitor.consistency;
                const aggressionBonus = competitor.aggression * 0.1;
                
                const timeChange = baseTimeChange + variation - aggressionBonus;
                competitor.time = Math.max(0, competitor.time + timeChange);
                
                competitor.stamina = Math.max(0, competitor.stamina - 0.5);
                competitor.pulse = Math.min(180, competitor.pulse + 0.3);
            }
        });
        
        this.allCompetitors.sort((a, b) => a.time - b.time);
        
        this.allCompetitors.forEach((competitor, index) => {
            competitor.position = index + 1;
        });
    }
    
    activateSprint() {
        if (this.player.stamina < 20) {
            return false;
        }
        
        this.player.speed += 2;
        this.player.stamina -= 15;
        this.player.pulse = Math.min(180, this.player.pulse + 20);
        
        console.log("Спринт активирован!");
        
        setTimeout(() => {
            this.player.speed = Math.max(5, this.player.speed - 2);
        }, 6000);
        
        return true;
    }
    
    activateSlowPace() {
        this.player.speed = Math.max(3, this.player.speed - 1);
        this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 10);
        this.player.pulse = Math.max(100, this.player.pulse - 10);
        
        console.log("Темп снижен");
        return true;
    }
    
    finishRace() {
        clearInterval(this.raceInterval);
        this.clearAllShootingTimers();
        this.isRacing = false;
        
        const playerPosition = this.player.position;
        let message = `Гонка завершена! Ваше место: ${playerPosition}`;
        
        if (playerPosition === 1) message += " 🥇 ПОБЕДА!";
        else if (playerPosition === 2) message += " 🥈";
        else if (playerPosition === 3) message += " 🥉";
        
        console.log(message);
        
        // Показываем сообщение через UI
        if (window.gameScreen) {
            window.gameScreen.showMessage(message, "success");
        }
        
        // Возвращаем в меню через 3 секунды
        setTimeout(() => {
            if (window.mainMenu) {
                window.mainMenu.show();
            }
        }, 3000);
        
        return playerPosition;
    }
    
    returnToMenu() {
        if (this.isRacing) {
            clearInterval(this.raceInterval);
            this.clearAllShootingTimers();
            this.isRacing = false;
        }
        this.isShooting = false;
        this.currentShootingRound = null;
        
        console.log("Возврат в главное меню");
        return true;
    }
    
    // Методы для интеграции с UI (обратная совместимость)
    showStartStage() {
        if (window.gameScreen) {
            window.gameScreen.showStartStage();
        }
    }
    
    updateShootingStep(step) {
        this.shootingStep = step;
        if (window.gameScreen) {
            window.gameScreen.updateShootingStep(step);
        }
    }
    
    showShootingResults() {
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }
}
