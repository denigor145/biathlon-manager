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
        
        // Ветер
        this.windConditions = ["Слабый ветер", "Умеренный ветер", "Сильный ветер"];
        
        // Система локаций с прогрессией
        this.locations = [
            { id: 0, name: "Новичковый стадион", minLevel: 0, maxLevel: 9, difficulty: 1 },
            { id: 1, name: "Горный курорт", minLevel: 10, maxLevel: 19, difficulty: 2 },
            { id: 2, name: "Лесная трасса", minLevel: 20, maxLevel: 29, difficulty: 3 },
            { id: 3, name: "Альпийский центр", minLevel: 30, maxLevel: 39, difficulty: 4 },
            { id: 4, name: "Северный полюс", minLevel: 40, maxLevel: 49, difficulty: 5 },
            { id: 5, name: "Олимпийский комплекс", minLevel: 50, maxLevel: 59, difficulty: 6 },
            { id: 6, name: "Мировой кубок", minLevel: 60, maxLevel: 69, difficulty: 7 },
            { id: 7, name: "Чемпионат мира", minLevel: 70, maxLevel: 79, difficulty: 8 },
            { id: 8, name: "Элитная лига", minLevel: 80, maxLevel: 89, difficulty: 9 },
            { id: 9, name: "Легендарная арена", minLevel: 90, maxLevel: 99, difficulty: 10 }
        ];
        
        this.currentLocation = 0;
        this.currentCup = 0;
        
        // Игрок (базовые значения, будут перезаписаны характеристиками)
        this.player = {
            name: "Вы",
            flag: "🎯",
            speed: 3,
            stamina: 60,
            maxStamina: 60,
            pulse: 120,
            position: 4,
            time: 18.3,
            isPlayer: true,
            shooting: {
                prone: 0.1,
                standing: 0.1
            },
            aggression: 0.7,
            consistency: 0.8,
            shootingSpeed: 10,
            level: 0
        };
        
        // Генерируем соперников для текущей локации
        this.opponents = this.generateCupOpponents(this.currentLocation, 0);
        this.allCompetitors = [this.player, ...this.opponents];
        
        console.log("Биатлон Менеджер инициализирован с системой локаций!");
    }
    
    // Генерация соперников для кубка с учетом прогрессии локаций
    generateCupOpponents(locationId, cupLevel) {
        const location = this.locations[locationId];
        const opponents = [];
        
        // Распределение по уровням внутри локации
        const levelDistribution = {};
        const levelRange = location.maxLevel - location.minLevel + 1;
        const levelsPerGroup = Math.ceil(levelRange / 3);
        
        // Создаем группы уровней внутри локации
        for (let group = 0; group < 3; group++) {
            const startLevel = location.minLevel + group * levelsPerGroup;
            const endLevel = Math.min(location.minLevel + (group + 1) * levelsPerGroup - 1, location.maxLevel);
            const count = group === 0 ? 2 : 3; // В первой группе 2 соперника, в остальных по 3
            
            for (let level = startLevel; level <= endLevel; level++) {
                levelDistribution[level] = (levelDistribution[level] || 0) + count;
            }
        }

        // Генерируем соперников согласно распределению
        for (let level = location.minLevel; level <= location.maxLevel; level++) {
            const count = levelDistribution[level] || 0;
            for (let i = 0; i < count; i++) {
                const opponent = this.generateOpponentByLevel(level, locationId, cupLevel);
                opponents.push(opponent);
            }
        }

        return opponents;
    }

    // Генерация одного соперника по уровню с прогрессивными характеристиками
    generateOpponentByLevel(level, locationId, cupLevel) {
        const names = ["Йоханссон", "Мюллер", "Мартен", "Ларссон", "Хубер", "Бё", "Фуркад"];
        const flags = ["🇳🇴", "🇩🇪", "🇫🇷", "🇸🇪", "🇦🇹", "🇫🇮", "🇮🇹"];
        
        // Прогрессия характеристик от уровня 0 до 99
        // Скорость: от 3 (уровень 0) до 8 (уровень 99)
        const speed = 3 + (level * 5 / 99);
        
        // Выносливость: от 60 (уровень 0) до 150 (уровень 99)
        const stamina = 60 + (level * 90 / 99);
        
        // Меткость: от 10% (уровень 0) до 80% (уровень 99)
        const accuracy = 10 + (level * 70 / 99);
        
        // Скорость стрельбы: от 10 секунд (уровень 0) до 3 секунд (уровень 99)
        const shootingSpeed = 10 - (level * 7 / 99);

        return {
            name: `${names[level % names.length]} Lv.${level}`,
            flag: flags[level % flags.length],
            speed: speed,
            stamina: stamina,
            maxStamina: stamina,
            pulse: 110 + Math.random() * 30,
            position: 0,
            time: level * 1.5, // Более сильные соперники начинают с лучшим временем
            isPlayer: false,
            shooting: {
                prone: Math.min(0.95, accuracy / 100 * 1.1),
                standing: Math.min(0.85, accuracy / 100 * 0.9)
            },
            aggression: Math.random(),
            consistency: 0.7 + Math.random() * 0.3,
            shootingSpeed: shootingSpeed,
            level: level,
            location: locationId
        };
    }

    // Метод для смены локации
    setLocation(locationId) {
        if (locationId >= 0 && locationId < this.locations.length) {
            this.currentLocation = locationId;
            this.opponents = this.generateCupOpponents(this.currentLocation, 0);
            this.allCompetitors = [this.player, ...this.opponents];
            console.log(`Переключена локация: ${this.locations[locationId].name}`);
            return true;
        }
        return false;
    }

    // Получить текущую локацию
    getCurrentLocation() {
        return this.locations[this.currentLocation];
    }
    
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
    
    getRandomWind() {
        return this.windConditions[Math.floor(Math.random() * this.windConditions.length)];
    }
    
    applyPlayerCharacteristics() {
        if (window.playerProfile && this.player) {
            window.playerProfile.applyToGamePlayer(this.player);
            console.log("Характеристики игрока применены:", this.player);
        }
    }
    
    startRace(raceType = null) {
        console.log("=== START RACE ===");
        
        if (raceType) {
            this.selectedRaceType = raceType;
        }
        
        this.currentRaceType = this.selectedRaceType;
        this.currentSegment = 1;
        this.totalTime = 0;
        this.isRacing = false;
        this.isShooting = false;
        this.currentShootingRound = null;
        this.shootingStep = 0;
        this.currentShootingIndex = 0;
        this.allShootingResults.clear();
        
        console.log("Параметры гонки установлены");
        console.log("Тип гонки:", this.currentRaceType);
        
        this.applyPlayerCharacteristics();
        
        this.allCompetitors.forEach((competitor, index) => {
            competitor.time = index * 0.5;
            competitor.position = index + 1;
            competitor.stamina = competitor.maxStamina;
            competitor.pulse = 120;
        });
        
        if (window.gameScreen) {
            window.gameScreen.showStartStage();
        }
        
        return true;
    }

    startRaceAfterStage() {
        this.isRacing = true;
        this.startRaceInterval();
        console.log("Гонка началась!");
        
        if (window.gameScreen) {
            window.gameScreen.hideStageScreen('startStageScreen');
            window.gameScreen.showScreen('gameScreen');
        }
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
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
        
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
        
        this.updateCompetitors();
        
        this.currentSegment++;
        this.totalTime += 2;
        
        console.log(`Переход к сегменту: ${this.currentSegment}`);
    }
    
    prepareShooting(shootingRound) {
        this.isShooting = true;
        this.currentShootingRound = shootingRound;
        
        clearInterval(this.raceInterval);
        
        console.log(`🚨 Подготовка к стрельбе: ${shootingRound.name}`);
        
        if (window.gameScreen) {
            window.gameScreen.showPreShootingStage(shootingRound);
        }
    }
    
    startShootingAfterStage() {
        console.log("🎯 Начало стрельбы после экрана подготовки");
        
        this.shootingStep = 0;
        
        this.allCompetitors.forEach(competitor => {
            this.allShootingResults.set(competitor, {
                hits: 0,
                misses: 0,
                shots: [null, null, null, null, null],
                finished: false
            });
        });
        
        if (window.gameScreen) {
            window.gameScreen.showShootingInProgress();
        }
        
        this.startIndividualShooting();
    }
    
    startIndividualShooting() {
        console.log("🎯 Запуск индивидуальной стрельбы");
        this.shootingStep = 0;
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
        
        this.allCompetitors.forEach(competitor => {
            this.startCompetitorShooting(competitor);
        });
    }
    
    startCompetitorShooting(competitor) {
        console.log(`🎯 ${competitor.name} начинает стрельбу (уровень скорости: ${competitor.shootingSpeed}с)`);
        
        let shotCount = 0;
        
        const makeShot = () => {
            if (shotCount < 5 && this.isShooting) {
                this.processCompetitorShot(competitor, shotCount);
                shotCount++;
                
                if (shotCount < 5) {
                    // Базовое время = shootingSpeed в секундах (от 3 до 10)
                    const baseTime = competitor.shootingSpeed * 1000; // Переводим в миллисекунды
                    // Случайное отклонение ±0.5 секунды
                    const randomVariation = (Math.random() - 0.5) * 1000;
                    const nextShotTime = baseTime + randomVariation;
                    
                    setTimeout(makeShot, nextShotTime);
                } else {
                    // Завершили стрельбу
                    console.log(`🎯 ${competitor.name} завершил стрельбу`);
                    this.checkShootingCompletion();
                }
            }
        };
        
        // Запускаем первый выстрел сразу
        setTimeout(makeShot, 100);
    }
    
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
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
        
        this.checkShootingCompletion();
    }
    
    checkShootingCompletion() {
        let allFinished = true;
        
        for (const [competitor, results] of this.allShootingResults) {
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
    
    clearAllShootingTimers() {
        this.isShooting = false;
    }
    
    finishShooting() {
        this.clearAllShootingTimers();
        
        console.log("🎯 ВСЕ УЧАСТНИКИ ЗАВЕРШИЛИ СТРЕЛЬБУ");
        
        this.allCompetitors.forEach(competitor => {
            const results = this.allShootingResults.get(competitor);
            const penaltyTime = results.misses * 10;
            competitor.time += penaltyTime;
            results.finished = true;
            
            console.log(`${competitor.name}: ${results.hits}/5, штраф: +${penaltyTime}сек, скорость стрельбы: ${competitor.shootingSpeed.toFixed(1)}`);
        });
        
        if (window.gameScreen) {
            window.gameScreen.showPostShootingStage();
        }
    }

    continueAfterShooting() {
        console.log("Продолжение гонки после стрельбы");
        
        this.isShooting = false;
        this.currentShootingRound = null;
        this.currentShootingIndex++;
        
        if (window.gameScreen) {
            window.gameScreen.hideShooting();
        }
        
        const race = this.getCurrentRace();
        if (this.currentSegment < race.totalSegments) {
            this.currentSegment++;
        }
        
        this.allCompetitors.sort((a, b) => a.time - b.time);
        this.allCompetitors.forEach((competitor, index) => {
            competitor.position = index + 1;
        });
        
        this.startRaceInterval();
        
        console.log(`Стрельба завершена, переходим к сегменту: ${this.currentSegment}`);
        
        if (this.currentSegment >= race.totalSegments) {
            this.finishRace();
        }
    }
    
    getShootingResults(competitor) {
        return this.allShootingResults.get(competitor);
    }
    
    getShootingStep() {
        return this.shootingStep;
    }
    
    isShootingInProgress() {
        return this.isShooting;
    }
    
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
            this.player.speed = Math.max(3, this.player.speed - 2);
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
        
        if (window.gameScreen) {
            window.gameScreen.showMessage(message, "success");
        }
        
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
}
