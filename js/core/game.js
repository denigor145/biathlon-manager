class BiathlonGame {
    constructor() {
        // Типы гонок с обновленными параметрами
        this.raceTypes = {
            sprint: {
                name: "Спринт",
                distance: "7.65 км",
                totalLaps: 3,
                segmentsPerLap: 17,
                totalSegments: 51,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа" },
                    { afterLap: 2, position: "standing", name: "Стрельба стоя" }
                ],
                description: "Короткая быстрая гонка с 2 стрельбами"
            },
            pursuit: {
                name: "Гонка преследования",
                distance: "8.4 км",
                totalLaps: 4,
                segmentsPerLap: 14,
                totalSegments: 56,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                    { afterLap: 2, position: "prone", name: "Стрельба лёжа 2" },
                    { afterLap: 3, position: "standing", name: "Стрельба стоя 1" },
                    { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
                ],
                description: "Средняя дистанция с 4 стрельбами"
            },
            mass: {
                name: "Масс-старт",
                distance: "12.75 км",
                totalLaps: 5,
                segmentsPerLap: 17,
                totalSegments: 85,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                    { afterLap: 2, position: "prone", name: "Стрельба лёжа 2" },
                    { afterLap: 3, position: "standing", name: "Стрельба стоя 1" },
                    { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
                ],
                description: "Длинная дистанция с 4 стрельбами"
            },
            individual: {
                name: "Индивидуальная гонка",
                distance: "15 км",
                totalLaps: 5,
                segmentsPerLap: 20,
                totalSegments: 100,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                    { afterLap: 2, position: "standing", name: "Стрельба стоя 1" },
                    { afterLap: 3, position: "prone", name: "Стрельба лёжа 2" },
                    { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
                ],
                description: "Самая длинная дистанция с 4 стрельбами"
            }
        };

        // Текущее состояние игры
        this.selectedRaceType = "sprint";
        this.currentRaceType = "sprint";
        this.isRacing = false;
        this.isShooting = false;
        this.raceInterval = null;
        
        // Состояние гонки
        this.raceStartTime = 0;
        this.realTimeElapsed = 0;
        
        // Система локаций с ограничениями уровней ботов
        this.locations = [
            { id: 0, name: "Новичковый стадион", minLevel: 0, maxLevel: 9, difficulty: 1, botMinLevel: 0, botMaxLevel: 5 },
            { id: 1, name: "Горный курорт", minLevel: 10, maxLevel: 19, difficulty: 2, botMinLevel: 4, botMaxLevel: 8 },
            { id: 2, name: "Лесная трасса", minLevel: 20, maxLevel: 29, difficulty: 3, botMinLevel: 9, botMaxLevel: 15 },
            { id: 3, name: "Альпийский центр", minLevel: 30, maxLevel: 39, difficulty: 4, botMinLevel: 10, botMaxLevel: 18 },
            { id: 4, name: "Северный полюс", minLevel: 40, maxLevel: 49, difficulty: 5, botMinLevel: 15, botMaxLevel: 20 },
            { id: 5, name: "Олимпийский комплекс", minLevel: 50, maxLevel: 59, difficulty: 6, botMinLevel: 20, botMaxLevel: 25 },
            { id: 6, name: "Мировой кубок", minLevel: 60, maxLevel: 69, difficulty: 7, botMinLevel: 24, botMaxLevel: 30 },
            { id: 7, name: "Чемпионат мира", minLevel: 70, maxLevel: 79, difficulty: 8, botMinLevel: 30, botMaxLevel: 40 },
            { id: 8, name: "Элитная лига", minLevel: 80, maxLevel: 89, difficulty: 9, botMinLevel: 35, botMaxLevel: 50 },
            { id: 9, name: "Легендарная арена", minLevel: 90, maxLevel: 99, difficulty: 10, botMinLevel: 50, botMaxLevel: 70 }
        ];
        
        this.currentLocation = 0;
        
        // Инициализация игрока (базовые значения)
        this.player = this.createPlayer();
        
        // Генерируем соперников с учетом ограничений текущей локации
        this.opponents = this.generateOpponents(16);
        this.allCompetitors = [this.player, ...this.opponents];
        
        // Состояние стрельбы
        this.shootingParticipants = new Map();
        this.allShootingResults = new Map();
        
        console.log("Биатлон Менеджер инициализирован с новой системой локаций!");
    }
    
    // Создание игрока
    createPlayer() {
        return {
            id: 'player',
            name: "Вы",
            flag: "🎯",
            speedMps: 2.78,
            stamina: 60,
            maxStamina: 60,
            pulse: 120,
            position: 1,
            totalGameTime: 0,
            completedSegments: 0,
            currentLap: 1,
            completedSegmentsInCurrentLap: 0,
            isPlayer: true,
            isRacing: false,
            isShooting: false,
            hasShotThisLap: false,
            shooting: {
                prone: 0.1,
                standing: 0.1
            },
            shootingSpeed: 6,
            level: 0,
            penaltyMinutes: 0,
            extraSegmentsPerLap: {},
            currentShooting: null,
            shootingResults: [],
            shotsFired: 0,
            shootingStartTime: 0,
            totalMisses: 0
        };
    }
    
    // Генерация соперников с учетом ограничений текущей локации
    generateOpponents(count) {
        const opponents = [];
        const names = [
            "Йоханссон", "Мюллер", "Мартен", "Ларссон", "Хубер", 
            "Бё", "Фуркад", "Самуэльссон", "Семёнов", "Пидно",
            "Уле", "Бьорндален", "Ландертингер", "Ферри", "Вайдель", "Логинов"
        ];
        const flags = ["🇳🇴", "🇩🇪", "🇫🇷", "🇸🇪", "🇦🇹", "🇫🇮", "🇮🇹", "🇨🇭", "🇷🇺", "🇺🇦", "🇨🇿", "🇸🇰", "🇧🇾", "🇰🇿", "🇨🇦", "🇺🇸"];
        
        const currentLocation = this.getCurrentLocation();
        const minLevel = currentLocation.botMinLevel;
        const maxLevel = currentLocation.botMaxLevel;
        
        for (let i = 0; i < count; i++) {
            const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
            const speedMps = 2.78 + (level * (5 - 2.78) / 70);
            const accuracy = 0.1 + (level * 0.7 / 70);
            const shootingSpeed = 6 - (level * 3 / 70);
            
            opponents.push({
                id: 'ai_' + i,
                name: `${names[i]}`,
                flag: flags[i % flags.length],
                speedMps: speedMps,
                stamina: 60 + (level * 90 / 70),
                maxStamina: 60 + (level * 90 / 70),
                pulse: 110 + Math.random() * 30,
                position: i + 2,
                totalGameTime: i * 2,
                completedSegments: 0,
                currentLap: 1,
                completedSegmentsInCurrentLap: 0,
                isPlayer: false,
                isRacing: false,
                isShooting: false,
                hasShotThisLap: false,
                shooting: {
                    prone: Math.min(0.95, accuracy * 1.1),
                    standing: Math.min(0.85, accuracy * 0.9)
                },
                shootingSpeed: shootingSpeed,
                level: level,
                penaltyMinutes: 0,
                extraSegmentsPerLap: {},
                currentShooting: null,
                shootingResults: [],
                shotsFired: 0,
                shootingStartTime: 0,
                aggression: 0.5 + Math.random() * 0.5,
                consistency: 0.7 + Math.random() * 0.3,
                totalMisses: 0
            });
        }
        
        console.log(`Сгенерировано ${opponents.length} ботов уровня ${minLevel}-${maxLevel} для локации "${currentLocation.name}"`);
        return opponents;
    }

    // Обновление соперников при смене локации
    updateOpponentsForLocation() {
        this.opponents = this.generateOpponents(16);
        this.allCompetitors = [this.player, ...this.opponents];
        console.log(`Соперники обновлены для локации: ${this.getCurrentLocation().name}`);
    }
    
    // Выбор типа гонки
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
    
    // Установка локации
    setLocation(locationId) {
        if (locationId >= 0 && locationId < this.locations.length) {
            this.currentLocation = locationId;
            this.updateOpponentsForLocation();
            console.log(`Переключена локация: ${this.locations[locationId].name}`);
            return true;
        }
        return false;
    }
    
    getCurrentLocation() {
        return this.locations[this.currentLocation];
    }

    // Получить информацию о доступности локации для игрока
    getLocationAccessInfo(locationId) {
        const location = this.locations[locationId];
        const playerLevel = window.playerProfile ? Math.max(
            window.playerProfile.stats.runningSpeed,
            window.playerProfile.stats.accuracy,
            window.playerProfile.stats.shootingSpeed,
            window.playerProfile.stats.stamina
        ) : 0;
        
        return {
            location: location,
            isAccessible: true,
            isRecommended: playerLevel >= location.minLevel,
            playerLevel: playerLevel
        };
    }
    
    // Запуск гонки
    startRace(raceType = null) {
        console.log("=== START RACE ===");
        
        if (raceType) {
            this.selectedRaceType = raceType;
        }
        
        this.currentRaceType = this.selectedRaceType;
        this.isRacing = false;
        this.isShooting = false;
        this.raceStartTime = 0;
        this.realTimeElapsed = 0;
        
        console.log("Параметры гонки установлены:", this.currentRaceType);
        
        this.applyPlayerCharacteristics();
        this.resetCompetitors();
        
        if (window.gameScreen) {
            window.gameScreen.showStartStage();
        }
        
        return true;
    }

    // Применение характеристик игрока
    applyPlayerCharacteristics() {
        if (window.playerProfile && this.player) {
            window.playerProfile.applyToGamePlayer(this.player);
        }
    }
    
    // Сброс состояния участников
    resetCompetitors() {
        this.allCompetitors.forEach((competitor, index) => {
            competitor.totalGameTime = index * 0.5;
            competitor.completedSegments = 0;
            competitor.currentLap = 1;
            competitor.completedSegmentsInCurrentLap = 0;
            competitor.isRacing = false;
            competitor.isShooting = false;
            competitor.hasShotThisLap = false;
            competitor.penaltyMinutes = 0;
            competitor.extraSegmentsPerLap = {};
            competitor.currentShooting = null;
            competitor.shootingResults = [];
            competitor.shotsFired = 0;
            competitor.shootingStartTime = 0;
            competitor.position = index + 1;
            competitor.stamina = competitor.maxStamina;
            competitor.pulse = 120;
            competitor.totalMisses = 0;
        });
        
        this.allCompetitors.sort((a, b) => a.totalGameTime - b.totalGameTime);
        this.updatePositions();
    }
    
    // Запуск гонки после экрана старта
    startRaceAfterStage() {
        this.isRacing = true;
        this.raceStartTime = Date.now();
        this.startRaceInterval();
        console.log("Гонка началась!");
        
        this.allCompetitors.forEach(competitor => {
            competitor.isRacing = true;
        });
        
        if (window.gameScreen) {
            window.gameScreen.hideStageScreen('startStageScreen');
            window.gameScreen.showScreen('gameScreen');
        }
    }
    
    // Запуск интервала гонки
    startRaceInterval() {
        this.raceInterval = setInterval(() => {
            this.updateRace();
        }, 2000);
    }
    
    // Основное обновление гонки
    updateRace() {
        if (!this.isRacing) return;
        
        this.realTimeElapsed = (Date.now() - this.raceStartTime) / 1000;
        
        this.allCompetitors.forEach(competitor => {
            if (competitor.isRacing && !competitor.isShooting) {
                this.updateCompetitorMovement(competitor);
            }
        });
        
        this.updatePositions();
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
        
        this.checkRaceCompletion();
    }
    
    // Обновление движения участника
    updateCompetitorMovement(competitor) {
        const race = this.getCurrentRace();
        
        if (competitor.currentLap > race.totalLaps) {
            competitor.isRacing = false;
            competitor.finished = true;
            return;
        }
        
        const segmentGameTime = this.calculateSegmentGameTime(competitor);
        competitor.totalGameTime += segmentGameTime;
        
        competitor.completedSegments++;
        competitor.completedSegmentsInCurrentLap++;
        
        console.log(`${competitor.name} движение: круг ${competitor.currentLap}, отрезок ${competitor.completedSegmentsInCurrentLap}`);
        
        this.checkShootingPoint(competitor);
        this.checkLapCompletion(competitor);
        this.updatePhysiology(competitor);
    }
    
    // Расчет игрового времени для отрезка
    calculateSegmentGameTime(competitor) {
        const baseTime = 150 / competitor.speedMps;
        const randomVariation = (Math.random() * 3 - 1) / 3.6;
        const variedSpeed = competitor.speedMps + randomVariation;
        return 150 / Math.max(2.5, variedSpeed);
    }
    
    // Проверка точки стрельбы
    checkShootingPoint(competitor) {
        const race = this.getCurrentRace();
        const currentLap = competitor.currentLap;
        
        const shootingRound = race.shootingRounds.find(round => round.afterLap === currentLap);
        
        if (shootingRound && !competitor.isShooting && !competitor.hasShotThisLap) {
            const totalSegmentsInLap = race.segmentsPerLap + (competitor.extraSegmentsPerLap[currentLap] || 0);
            
            console.log(`${competitor.name} проверка стрельбы: круг ${currentLap}, отрезков в круге: ${competitor.completedSegmentsInCurrentLap}, всего нужно: ${totalSegmentsInLap}, стрелял в круге: ${competitor.hasShotThisLap}`);
            
            if (competitor.completedSegmentsInCurrentLap >= totalSegmentsInLap) {
                competitor.isRacing = false;
                competitor.hasShotThisLap = true;
                console.log(`${competitor.name} начинает стрельбу после ${totalSegmentsInLap} отрезков в круге ${currentLap}`);
                this.startShooting(competitor, shootingRound);
            }
        }
    }
    
    // Проверка завершения круга
    checkLapCompletion(competitor) {
        const race = this.getCurrentRace();
        const currentLap = competitor.currentLap;
        
        if (currentLap <= race.totalLaps) {
            const totalSegmentsInLap = race.segmentsPerLap + (competitor.extraSegmentsPerLap[currentLap] || 0);
            
            console.log(`${competitor.name} проверка перехода на следующий круг: круг ${currentLap}, отрезков: ${competitor.completedSegmentsInCurrentLap}, всего нужно: ${totalSegmentsInLap}`);
            
            if (competitor.completedSegmentsInCurrentLap >= totalSegmentsInLap) {
                if (currentLap < race.totalLaps) {
                    competitor.currentLap++;
                    competitor.completedSegmentsInCurrentLap = 0;
                    competitor.hasShotThisLap = false;
                    
                    console.log(`${competitor.name} перешел на круг ${competitor.currentLap}`);
                } else {
                    competitor.finished = true;
                    competitor.isRacing = false;
                    console.log(`${competitor.name} финишировал!`);
                }
            }
        }
    }
    
    // Обновление физиологических показателей
    updatePhysiology(competitor) {
        competitor.stamina = Math.max(0, competitor.stamina - 0.5);
        competitor.pulse = Math.min(180, competitor.pulse + 0.3);
        
        if (competitor.speedMps < 3.5) {
            competitor.stamina = Math.min(competitor.maxStamina, competitor.stamina + 0.2);
            competitor.pulse = Math.max(100, competitor.pulse - 0.1);
        }
    }
    
    // Начало стрельбы
    startShooting(competitor, shootingRound) {
        competitor.isShooting = true;
        competitor.currentShooting = shootingRound;
        competitor.shootingResults = [];
        competitor.shotsFired = 0;
        competitor.shootingStartTime = Date.now();
        
        console.log(`${competitor.name} начинает стрельбу: ${shootingRound.name}`);
        
        this.processShooting(competitor);
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }
    
    // Процесс стрельбы
    processShooting(competitor) {
        if (competitor.shotsFired < 5 && competitor.isShooting) {
            const isHit = this.makeShot(competitor);
            competitor.shootingResults.push(isHit);
            competitor.shotsFired++;
            
            console.log(`${competitor.name}: выстрел ${competitor.shotsFired} - ${isHit ? 'ПОПАДАНИЕ' : 'ПРОМАХ'}`);
            
            if (window.gameScreen) {
                window.gameScreen.updateDisplay();
            }
            
            if (competitor.shotsFired < 5) {
                const shotInterval = competitor.shootingSpeed * 1000;
                setTimeout(() => {
                    if (competitor.isShooting) {
                        this.processShooting(competitor);
                    }
                }, shotInterval);
            } else {
                this.finishShooting(competitor);
            }
        }
    }
    
    // Совершение выстрела
    makeShot(competitor) {
        const shootingRound = competitor.currentShooting;
        const accuracy = competitor.shooting[shootingRound.position];
        const consistency = competitor.consistency || 0.8;
        const effectiveAccuracy = accuracy * consistency;
        return Math.random() < effectiveAccuracy;
    }
    
    // Завершение стрельбы
    finishShooting(competitor) {
        if (!competitor.isShooting) return;
        
        const shootingRealTime = (Date.now() - competitor.shootingStartTime) / 1000;
        console.log(`${competitor.name} завершил стрельбу за ${shootingRealTime.toFixed(1)} секунд`);
        
        competitor.totalGameTime += shootingRealTime;
        const misses = competitor.shootingResults.filter(result => !result).length;
        competitor.totalMisses += misses;
        
        this.applyShootingPenalty(competitor, misses);
        
        console.log(`${competitor.name}: ${5 - misses}/5, промахов: ${misses} (всего за гонку: ${competitor.totalMisses})`);
        
        competitor.isShooting = false;
        competitor.isRacing = true;
        competitor.currentShooting = null;
        competitor.shootingResults = [];
        competitor.shotsFired = 0;
        competitor.shootingStartTime = 0;
        
        this.updatePositions();
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }
    
    // Применение штрафов за стрельбу
    applyShootingPenalty(competitor, misses) {
        const race = this.getCurrentRace();
        
        if (this.currentRaceType === 'individual') {
            competitor.penaltyMinutes += misses;
            console.log(`${competitor.name}: +${misses} минут штрафа (всего: ${competitor.penaltyMinutes} минут)`);
        } else {
            const nextLap = competitor.currentLap;
            competitor.extraSegmentsPerLap[nextLap] = (competitor.extraSegmentsPerLap[nextLap] || 0) + misses;
            console.log(`${competitor.name}: +${misses} отрезков в круге ${nextLap} (всего штрафных: ${competitor.extraSegmentsPerLap[nextLap]})`);
        }
    }
    
    // Обновление позиций
    updatePositions() {
        const tempCompetitors = [...this.allCompetitors];
        
        tempCompetitors.sort((a, b) => {
            if (a.totalGameTime !== b.totalGameTime) {
                return a.totalGameTime - b.totalGameTime;
            }
            
            if (a.isShooting && !b.isShooting) return 1;
            if (!a.isShooting && b.isShooting) return -1;
            
            return 0;
        });
        
        tempCompetitors.forEach((competitor, index) => {
            competitor.position = index + 1;
        });
        
        this.allCompetitors = tempCompetitors;
    }
    
    // Получение текущего круга участника
    getCurrentLap(competitor) {
        return competitor.currentLap;
    }
    
    // Получение текущего сегмента в круге
    getCurrentSegmentInLap(competitor) {
        return competitor.completedSegmentsInCurrentLap;
    }
    
    // Проверка завершения гонки
    checkRaceCompletion() {
        const race = this.getCurrentRace();
        
        const allFinished = this.allCompetitors.every(competitor => 
            competitor.finished || competitor.currentLap > race.totalLaps
        );
        
        if (allFinished) {
            this.finishRace();
            return;
        }
    }
    
    // Завершение гонки
    finishRace() {
        clearInterval(this.raceInterval);
        this.isRacing = false;
        this.raceFinished = true;
        
        if (this.currentRaceType === 'individual') {
            this.allCompetitors.forEach(competitor => {
                competitor.totalGameTime += competitor.penaltyMinutes * 60;
            });
            this.updatePositions();
        }
        
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
        }, 5000);
        
        return playerPosition;
    }
    
    // Активация спринта
    activateSprint() {
        if (this.player.stamina < 20) {
            return false;
        }
        
        this.player.speedMps += 1;
        this.player.stamina -= 15;
        this.player.pulse = Math.min(180, this.player.pulse + 20);
        
        console.log("Спринт активирован!");
        
        setTimeout(() => {
            this.player.speedMps = Math.max(2.78, this.player.speedMps - 1);
        }, 6000);
        
        return true;
    }
    
    // Активация медленного темпа
    activateSlowPace() {
        this.player.speedMps = Math.max(2.78, this.player.speedMps - 0.5);
        this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 10);
        this.player.pulse = Math.max(100, this.player.pulse - 10);
        
        console.log("Темп снижен");
        return true;
    }
    
    // Получение отставания игрока
    getPlayerGap() {
        const leader = this.allCompetitors[0];
        return this.player.totalGameTime - leader.totalGameTime;
    }
    
    // Получение результатов стрельбы
    getShootingResults(competitor) {
        return {
            hits: competitor.shootingResults.filter(result => result).length,
            misses: competitor.shootingResults.filter(result => !result).length,
            shots: [...competitor.shootingResults],
            finished: !competitor.isShooting && competitor.shootingResults.length === 5
        };
    }
    
    // Проверка, идет ли стрельба
    isShootingInProgress() {
        return this.allCompetitors.some(competitor => competitor.isShooting);
    }
    
    // Возврат в меню
    returnToMenu() {
        if (this.isRacing) {
            clearInterval(this.raceInterval);
            this.isRacing = false;
        }
        this.isShooting = false;
        
        console.log("Возврат в главное меню");
        return true;
    }
    
    // Получение случайного ветра
    getRandomWind() {
        const windConditions = ["Слабый ветер", "Умеренный ветер", "Сильный ветер"];
        return windConditions[Math.floor(Math.random() * windConditions.length)];
    }
    
    // Получение значения штрафа для отображения
    getPenaltyDisplayValue(competitor) {
        if (this.currentRaceType === 'individual') {
            return competitor.penaltyMinutes;
        } else {
            return competitor.totalMisses;
        }
    }
}
