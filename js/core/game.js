class BiathlonGame {
    constructor() {
        // Типы гонок с обновленными параметрами (расстояния в метрах)
        this.raceTypes = {
            sprint: {
                name: "Спринт",
                totalDistance: 7650, // 7.65 км в метрах
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
                totalDistance: 8400, // 8.4 км в метрах
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
                totalDistance: 12750, // 12.75 км в метрах
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
                totalDistance: 15000, // 15 км в метрах
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
        this.raceInterval = null;
        
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
        
        console.log("Биатлон Менеджер инициализирован с новой системой времени!");
    }
    
    // Создание игрока с новой системой времени
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
            
            // Новая система времени
            totalGameTime: 0,              // Общее игровое время
            raceGameTime: 0,               // Время на трассе (расчет из скорости)
            shootingGameTime: 0,           // Время стрельбы (реальное = игровое)
            penaltyGameTime: 0,            // Время штрафных кругов (расчет из скорости)
            
            // Дистанция
            distanceCovered: 0,            // Пройденное расстояние по основной трассе (метры)
            penaltyDistanceCovered: 0,     // Пройденное расстояние в штрафных кругах (метры)
            
            // Состояния
            currentState: 'racing',        // 'racing', 'shooting', 'penalty_loop', 'finished'
            isRacing: false,
            isShooting: false,
            finished: false,
            
            // Стрельба
            shooting: {
                prone: 0.1,
                standing: 0.1
            },
            shootingInterval: 6.0,         // Время между выстрелами (секунды)
            currentShootingRound: null,
            shootingResults: [],
            shotsFired: 0,
            shootingStartTime: 0,
            
            // Штрафы
            penaltyMinutes: 0,             // Для индивидуальной гонки
            penaltyLoops: 0,               // Количество штрафных кругов
            totalMisses: 0,
            
            // Прогресс
            completedSegments: 0,
            currentLap: 1,
            completedSegmentsInCurrentLap: 0,
            completedShootingRounds: [],
            
            isPlayer: true,
            level: 0,
            justReturnedFromShooting: false
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
            const shootingInterval = 6 - (level * 3 / 70);
            
            opponents.push({
                id: 'ai_' + i,
                name: `${names[i]}`,
                flag: flags[i % flags.length],
                speedMps: speedMps,
                stamina: 60 + (level * 90 / 70),
                maxStamina: 60 + (level * 90 / 70),
                pulse: 110 + Math.random() * 30,
                position: i + 2,
                
                // Новая система времени
                totalGameTime: 0,
                raceGameTime: 0,
                shootingGameTime: 0,
                penaltyGameTime: 0,
                
                // Дистанция
                distanceCovered: 0,
                penaltyDistanceCovered: 0,
                
                // Состояния
                currentState: 'racing',
                isRacing: false,
                isShooting: false,
                finished: false,
                
                // Стрельба
                shooting: {
                    prone: Math.min(0.95, accuracy * 1.1),
                    standing: Math.min(0.85, accuracy * 0.9)
                },
                shootingInterval: shootingInterval,
                currentShootingRound: null,
                shootingResults: [],
                shotsFired: 0,
                shootingStartTime: 0,
                
                // Штрафы
                penaltyMinutes: 0,
                penaltyLoops: 0,
                totalMisses: 0,
                
                // Прогресс
                completedSegments: 0,
                currentLap: 1,
                completedSegmentsInCurrentLap: 0,
                completedShootingRounds: [],
                
                isPlayer: false,
                level: level,
                aggression: 0.5 + Math.random() * 0.5,
                consistency: 0.7 + Math.random() * 0.3,
                justReturnedFromShooting: false
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
        this.raceStartTime = 0;
        
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
            // Сбрасываем время
            competitor.totalGameTime = 0;
            competitor.raceGameTime = 0;
            competitor.shootingGameTime = 0;
            competitor.penaltyGameTime = 0;
            
            // Сбрасываем дистанцию
            competitor.distanceCovered = 0;
            competitor.penaltyDistanceCovered = 0;
            
            // Сбрасываем состояние
            competitor.currentState = 'racing';
            competitor.isRacing = false;
            competitor.isShooting = false;
            competitor.finished = false;
            
            // Сбрасываем прогресс
            competitor.completedSegments = 0;
            competitor.currentLap = 1;
            competitor.completedSegmentsInCurrentLap = 0;
            competitor.completedShootingRounds = [];
            
            // Сбрасываем стрельбу
            competitor.currentShootingRound = null;
            competitor.shootingResults = [];
            competitor.shotsFired = 0;
            competitor.shootingStartTime = 0;
            
            // Сбрасываем штрафы
            competitor.penaltyMinutes = 0;
            competitor.penaltyLoops = 0;
            competitor.totalMisses = 0;
            
            // Сбрасываем флаг возвращения со стрельбы
            competitor.justReturnedFromShooting = false;
            
            // Восстанавливаем стамину
            competitor.stamina = competitor.maxStamina;
            competitor.pulse = 120;
            
            competitor.position = index + 1;
        });
        
        this.allCompetitors.sort((a, b) => a.position - b.position);
        console.log("Участники сброшены для новой гонки");
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
        }, 2000); // Обновление каждые 2 секунды реального времени
    }
    
    // Основное обновление гонки
    updateRace() {
        if (!this.isRacing) return;
        
        this.allCompetitors.forEach(competitor => {
            if (competitor.finished) return;
            
            switch(competitor.currentState) {
                case 'racing':
                    this.updateRacingState(competitor);
                    break;
                case 'shooting':
                    this.updateShootingState(competitor);
                    break;
                case 'penalty_loop':
                    this.updatePenaltyLoopState(competitor);
                    break;
            }
            
            // Обновляем общее время
            this.updateTotalTime(competitor);
        });
        
        this.updatePositions();
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
        
        this.checkRaceCompletion();
    }
    
    // Обновление состояния гонки
    updateRacingState(competitor) {
        const race = this.getCurrentRace();
        const segmentDistance = 150; // 150 метров на отрезок
        
        // Расчет времени прохождения отрезка на основе скорости
        const segmentGameTime = segmentDistance / competitor.speedMps;
        
        // Увеличиваем гоночное время
        competitor.raceGameTime += segmentGameTime;
        
        // Увеличиваем пройденную дистанцию
        competitor.distanceCovered += segmentDistance;
        competitor.completedSegments++;
        competitor.completedSegmentsInCurrentLap++;
        
        console.log(`${competitor.name}: круг ${competitor.currentLap}, отрезок ${competitor.completedSegmentsInCurrentLap}, дистанция: ${competitor.distanceCovered}м`);
        
        // Проверяем точку стрельбы только если это не возвращение после стрельбы
        if (!competitor.justReturnedFromShooting) {
            this.checkShootingPoint(competitor);
        } else {
            competitor.justReturnedFromShooting = false;
        }
        
        // Проверяем завершение круга
        this.checkLapCompletion(competitor);
        
        // Обновляем физиологию
        this.updatePhysiology(competitor);
    }
    
    // Обновление состояния стрельбы
    updateShootingState(competitor) {
        // Реальное время стрельбы = игровое время
        competitor.shootingGameTime += 2; // 2 секунды реального времени = 2 секунды игрового
        
        // Автоматическая стрельба с интервалом
        if (competitor.shotsFired < 5) {
            const timeSinceLastShot = competitor.shootingGameTime - (competitor.shotsFired * competitor.shootingInterval);
            
            if (timeSinceLastShot >= competitor.shootingInterval) {
                this.makeShot(competitor);
            }
        }
        
        // Если все выстрелы сделаны, завершаем стрельбу
        if (competitor.shotsFired >= 5) {
            this.finishShooting(competitor);
        }
    }
    
    // Обновление состояния штрафных кругов
    updatePenaltyLoopState(competitor) {
        const penaltySegmentDistance = 150; // 150 метров на штрафной отрезок
        
        // Расчет времени прохождения штрафного отрезка
        const segmentGameTime = penaltySegmentDistance / competitor.speedMps;
        
        // Увеличиваем время штрафных кругов
        competitor.penaltyGameTime += segmentGameTime;
        
        // Увеличиваем пройденную дистанцию в штрафных кругах
        competitor.penaltyDistanceCovered += penaltySegmentDistance;
        
        console.log(`${competitor.name}: штрафной круг, пройдено: ${competitor.penaltyDistanceCovered}м`);
        
        // Проверяем завершение штрафных кругов
        if (competitor.penaltyDistanceCovered >= competitor.penaltyLoops * 150) {
            competitor.currentState = 'racing';
            competitor.penaltyDistanceCovered = 0;
            competitor.penaltyLoops = 0;
            console.log(`${competitor.name} завершил штрафные круги и возвращается к гонке`);
        }
    }
    
    // Обновление общего времени
    updateTotalTime(competitor) {
        competitor.totalGameTime = competitor.raceGameTime + competitor.shootingGameTime + competitor.penaltyGameTime;
        
        // Для индивидуальной гонки добавляем штрафные минуты в конце
        if (this.currentRaceType === 'individual' && competitor.finished) {
            competitor.totalGameTime += competitor.penaltyMinutes * 60;
        }
    }
    
    // Проверка точки стрельбы
    checkShootingPoint(competitor) {
        const race = this.getCurrentRace();
        const currentLap = competitor.currentLap;
        
        const shootingRound = race.shootingRounds.find(round => 
            round.afterLap === currentLap && 
            !competitor.completedShootingRounds.includes(round)
        );
        
        if (shootingRound) {
            const totalSegmentsInLap = race.segmentsPerLap;
            
            if (competitor.completedSegmentsInCurrentLap >= totalSegmentsInLap) {
                console.log(`${competitor.name} достиг стрельбища в круге ${currentLap}`);
                this.startShooting(competitor, shootingRound);
            }
        }
    }
    
    // Проверка завершения круга
    checkLapCompletion(competitor) {
        const race = this.getCurrentRace();
        const currentLap = competitor.currentLap;
        
        const totalSegmentsInLap = race.segmentsPerLap;
        
        if (competitor.completedSegmentsInCurrentLap >= totalSegmentsInLap) {
            if (currentLap < race.totalLaps) {
                competitor.currentLap++;
                competitor.completedSegmentsInCurrentLap = 0;
                console.log(`${competitor.name} перешел на круг ${competitor.currentLap}`);
            } else {
                // Проверяем финиш
                if (competitor.distanceCovered >= race.totalDistance) {
                    competitor.finished = true;
                    competitor.currentState = 'finished';
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
        competitor.currentState = 'shooting';
        competitor.isShooting = true;
        competitor.currentShootingRound = shootingRound;
        competitor.shootingResults = [];
        competitor.shotsFired = 0;
        competitor.shootingStartTime = Date.now();
        
        console.log(`${competitor.name} начинает стрельбу: ${shootingRound.name}`);
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }
    
    // Совершение выстрела
    makeShot(competitor) {
        const shootingRound = competitor.currentShootingRound;
        const accuracy = competitor.shooting[shootingRound.position];
        const consistency = competitor.consistency || 0.8;
        const effectiveAccuracy = accuracy * consistency;
        const isHit = Math.random() < effectiveAccuracy;
        
        competitor.shootingResults.push(isHit);
        competitor.shotsFired++;
        
        if (!isHit) {
            competitor.totalMisses++;
        }
        
        console.log(`${competitor.name}: выстрел ${competitor.shotsFired} - ${isHit ? 'ПОПАДАНИЕ' : 'ПРОМАХ'}`);
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }
    
    // Завершение стрельбы
    finishShooting(competitor) {
        const misses = competitor.shootingResults.filter(result => !result).length;
        
        console.log(`${competitor.name} завершил стрельбу: ${5 - misses}/5, промахов: ${misses}`);
        
        // Применяем штрафы
        this.applyShootingPenalty(competitor, misses);
        
        // Отмечаем пройденную стрельбу
        competitor.completedShootingRounds.push(competitor.currentShootingRound);
        
        // Сбрасываем состояние стрельбы
        competitor.isShooting = false;
        competitor.currentShootingRound = null;
        competitor.shootingResults = [];
        competitor.shotsFired = 0;
        competitor.shootingStartTime = 0;
        
        // Определяем следующее состояние
        if (competitor.penaltyLoops > 0 && this.currentRaceType !== 'individual') {
            competitor.currentState = 'penalty_loop';
            console.log(`${competitor.name} переходит к штрафным кругам: ${competitor.penaltyLoops} кругов`);
        } else {
            competitor.currentState = 'racing';
            competitor.justReturnedFromShooting = true;
            
            // После стрельбы продолжаем с того же места на трассе
            // Увеличиваем счетчик сегментов, чтобы продолжить с правильной позиции
            if (competitor.completedSegmentsInCurrentLap === 0) {
                competitor.completedSegmentsInCurrentLap = 1;
            }
            
            console.log(`${competitor.name} возвращается к гонке`);
        }
        
        this.updatePositions();
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }
    
    // Применение штрафов за стрельбу
    applyShootingPenalty(competitor, misses) {
        if (this.currentRaceType === 'individual') {
            // Для индивидуальной гонки - штрафные минуты
            competitor.penaltyMinutes += misses;
            console.log(`${competitor.name}: +${misses} минут штрафа (всего: ${competitor.penaltyMinutes} минут)`);
        } else {
            // Для других гонки - штрафные круги
            competitor.penaltyLoops += misses;
            console.log(`${competitor.name}: +${misses} штрафных кругов (всего: ${competitor.penaltyLoops} кругов)`);
        }
    }
    
    // Обновление позиций
    updatePositions() {
        const tempCompetitors = [...this.allCompetitors];
        
        tempCompetitors.sort((a, b) => {
            // Сначала финишировавшие
            if (a.finished && !b.finished) return -1;
            if (!a.finished && b.finished) return 1;
            
            // Участники на трассе имеют приоритет над теми, кто на стрельбе
            if (a.currentState === 'racing' && b.currentState === 'shooting') return -1;
            if (a.currentState === 'shooting' && b.currentState === 'racing') return 1;
            
            // Участники на штрафных кругах имеют приоритет над теми, кто на стрельбе
            if (a.currentState === 'penalty_loop' && b.currentState === 'shooting') return -1;
            if (a.currentState === 'shooting' && b.currentState === 'penalty_loop') return 1;
            
            // Затем по дистанции (больше = лучше)
            if (a.distanceCovered !== b.distanceCovered) {
                return b.distanceCovered - a.distanceCovered;
            }
            
            // При равной дистанции - по общему времени (меньше = лучше)
            return a.totalGameTime - b.totalGameTime;
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
            competitor.finished || competitor.distanceCovered >= race.totalDistance
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
        
        // Финальный расчет времени для индивидуальной гонки
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
        
        // Сохраняем результат в историю
        if (window.raceManager) {
            const raceType = this.currentRaceType;
            const time = this.player.totalGameTime;
            const stats = {
                runningSpeed: window.playerProfile ? window.playerProfile.stats.runningSpeed : 0,
                accuracy: window.playerProfile ? window.playerProfile.stats.accuracy : 0,
                shootingSpeed: window.playerProfile ? window.playerProfile.stats.shootingSpeed : 0,
                stamina: window.playerProfile ? window.playerProfile.stats.stamina : 0
            };
            
            window.raceManager.saveRaceResult(raceType, playerPosition, time, stats);
        }
        
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
    
    // Получение значения штрафа для отображения
    getPenaltyDisplayValue(competitor) {
        if (this.currentRaceType === 'individual') {
            return competitor.penaltyMinutes;
        } else {
            return competitor.penaltyLoops;
        }
    }
    
    // Возврат в меню
    returnToMenu() {
        if (this.isRacing) {
            clearInterval(this.raceInterval);
            this.isRacing = false;
        }
        
        console.log("Возврат в главное меню");
        return true;
    }
    
    // Получение случайного ветра
    getRandomWind() {
        const windConditions = ["Слабый ветер", "Умеренный ветер", "Сильный ветер"];
        return windConditions[Math.floor(Math.random() * windConditions.length)];
    }
}
