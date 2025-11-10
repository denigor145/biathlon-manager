// js/core/game.js - БИАТЛОННЫЙ МЕНЕДЖЕР С УСКОРЕННОЙ СИСТЕМОЙ
class BiathlonGame {
    constructor() {
        // Основное состояние игры
        this.currentRaceType = "SPRINT";
        this.isRacing = false;
        this.isPaused = false;
        this.raceStartTime = 0;
        this.lastUpdateTime = 0;
        this.gameLoopId = null;
        
        // Текущая гонка
        this.race = null;
        this.location = null;
        
        // Участники
        this.player = null;
        this.opponents = [];
        this.allCompetitors = [];
        
        // Внешние условия
        this.windConditions = ["Слабый ветер", "Умеренный ветер", "Сильный ветер"];
        this.currentWind = "Слабый ветер";
        this.trackCondition = 1.0;
        
        // Система локаций
        this.currentLocationId = 0;
        this.locations = GameConstants.LOCATIONS;
        
        console.log("Биатлонный менеджер инициализирован с УСКОРЕННОЙ системой!");
    }

    // === МЕТОДЫ ДЛЯ ИНТЕГРАЦИИ С MAIN-MENU ===
    
    // Выбор типа гонки
    selectRaceType(raceType) {
        const normalizedRaceType = raceType.toUpperCase();
        
        if (GameConstants.RACE_TYPES[normalizedRaceType]) {
            this.currentRaceType = normalizedRaceType;
            console.log(`Выбран тип гонки: ${normalizedRaceType}`);
            return true;
        } else {
            console.error(`Неизвестный тип гонки: ${raceType} (нормализовано: ${normalizedRaceType})`);
            return false;
        }
    }
    
    // Получить выбранную гонку
    getSelectedRace() {
        return GameConstants.RACE_TYPES[this.currentRaceType];
    }
    
    // Получить текущую локацию
    getCurrentLocation() {
        return this.locations[this.currentLocationId];
    }
    
    // Установить локацию
    setLocation(locationId) {
        if (locationId >= 0 && locationId < this.locations.length) {
            this.currentLocationId = locationId;
            this.location = this.locations[locationId];
            console.log(`Установлена локация: ${this.location.name}`);
            return true;
        }
        return false;
    }
    
    // Получить информацию о доступе к локации
    getLocationAccessInfo(locationId) {
        const location = this.locations[locationId];
        const playerLevel = window.playerProfile ? window.playerProfile.getPlayerLevel() : 0;
        
        return {
            playerLevel: playerLevel,
            hasAccess: playerLevel >= location.minLevel,
            isRecommended: playerLevel >= location.minLevel && playerLevel <= location.maxLevel,
            isTooEasy: playerLevel > location.maxLevel
        };
    }

    // === ИСПРАВЛЕНИЕ ДЛЯ GAME-SCREEN ===
    
    // Запуск гонки после экрана старта
    startRaceAfterStage() {
        console.log("Запуск гонки после экрана старта");
        return this.startRace();
    }

    // === ОСНОВНЫЕ МЕТОДЫ ===
    
    // Инициализация гонки
    initializeRace(raceType, locationId = null) {
        // Если передан raceType, устанавливаем его
        if (raceType) {
            const normalizedRaceType = raceType.toUpperCase();
            this.selectRaceType(normalizedRaceType);
        }
        
        // Проверяем, что гонка установлена
        if (!this.currentRaceType) {
            console.error("Тип гонки не установлен!");
            return false;
        }
        
        this.race = GameConstants.RACE_TYPES[this.currentRaceType];
        
        if (!this.race) {
            console.error(`Гонка не найдена: ${this.currentRaceType}`);
            return false;
        }
        
        if (locationId !== null) {
            this.currentLocationId = locationId;
        }
        this.location = this.locations[this.currentLocationId];
        
        // Создаем участников
        this.player = this.createPlayer();
        this.opponents = this.generateOpponents(16);
        this.allCompetitors = [this.player, ...this.opponents];
        
        // Инициализируем позиции
        this.updatePositions();
        
        // Сбрасываем состояние гонки
        this.isRacing = false;
        this.isPaused = false;
        this.raceStartTime = 0;
        this.lastUpdateTime = 0;
        
        // Устанавливаем внешние условия
        this.currentWind = this.getRandomWind();
        this.trackCondition = this.location.trackCondition;
        
        console.log(`Гонка инициализирована: ${this.race.name}, Локация: ${this.location.name}`);
        console.log(`Участников: ${this.allCompetitors.length}, Игрок: ${this.player.name}`);
        
        return true;
    }

    // Создание игрока с новой системой состояний
    createPlayer() {
        return {
            id: 'player',
            name: "Вы",
            flag: "🎯",
            
            // Основное состояние
            currentState: GameConstants.PLAYER_STATES.START,
            isRacing: false,
            finished: false,
            
            // Прогресс гонки
            currentLap: 1,
            lapProgress: 0,
            distanceCovered: 0,
            totalDistance: 0,
            position: 1,
            
            // Физические параметры
            baseSpeedMps: GameConstants.PLAYER.MIN_SPEED,
            currentSpeedMps: GameConstants.PLAYER.MIN_SPEED,
            intensityLevel: 4,
            stamina: GameConstants.PLAYER.MAX_STAMINA,
            pulse: GameConstants.PLAYER.MIN_PULSE,
            
            // Стрельба
            shooting: {
                prone: GameConstants.PLAYER.MIN_ACCURACY,
                standing: GameConstants.PLAYER.MIN_ACCURACY
            },
            shootingInterval: GameConstants.SHOOTING.MAX_SHOOTING_INTERVAL,
            currentShootingRound: null,
            shootingProgress: 0,
            shotsFired: 0,
            shootingResults: [],
            shootingStartTime: 0,
            
            // Штрафы
            penaltyMinutes: 0,
            penaltyLoops: 0,
            penaltyProgress: 0,
            totalMisses: 0,
            
            // Время
            raceTime: 0,
            shootingTime: 0,
            penaltyTime: 0,
            totalTime: 0,
            
            // Технические
            isPlayer: true,
            level: 0,
            completedShootingRounds: [],
            justReturnedFromShooting: false
        };
    }

    // Генерация соперников с учетом локации
    generateOpponents(count) {
        const opponents = [];
        const names = [
            "Йоханссон", "Мюллер", "Мартен", "Ларссон", "Хубер", 
            "Бё", "Фуркад", "Самуэльссон", "Семёнов", "Пидно",
            "Уле", "Бьорндален", "Ландертингер", "Ферри", "Вайдель", "Логинов"
        ];
        const flags = ["🇳🇴", "🇩🇪", "🇫🇷", "🇸🇪", "🇦🇹", "🇫🇮", "🇮🇹", "🇨🇭", "🇷🇺", "🇺🇦", "🇨🇿", "🇸🇰", "🇧🇾", "🇰🇿", "🇨🇦", "🇺🇸"];
        
        const minLevel = this.location.botMinLevel;
        const maxLevel = this.location.botMaxLevel;
        
        for (let i = 0; i < count; i++) {
            const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
            const baseSpeedMps = this.calculateSpeedFromLevel(level);
            const accuracy = GameConstants.PLAYER.MIN_ACCURACY + (level / 60) * (GameConstants.PLAYER.MAX_ACCURACY - GameConstants.PLAYER.MIN_ACCURACY);
            const shootingInterval = this.calculateShootingInterval(level);
            
            opponents.push({
                id: 'ai_' + i,
                name: `${names[i]}`,
                flag: flags[i % flags.length],
                
                // Основное состояние
                currentState: GameConstants.PLAYER_STATES.START,
                isRacing: false,
                finished: false,
                
                // Прогресс гонки
                currentLap: 1,
                lapProgress: 0,
                distanceCovered: 0,
                totalDistance: 0,
                position: i + 2, // Временная позиция, будет обновлена
                
                // Физические параметры
                baseSpeedMps: baseSpeedMps,
                currentSpeedMps: baseSpeedMps,
                intensityLevel: 4 + Math.floor(Math.random() * 2),
                stamina: GameConstants.PLAYER.MAX_STAMINA,
                pulse: GameConstants.PLAYER.MIN_PULSE + Math.random() * 20,
                
                // Стрельба
                shooting: {
                    prone: Math.min(GameConstants.PLAYER.MAX_ACCURACY, accuracy * GameConstants.SHOOTING.PRONE_ACCURACY_BONUS),
                    standing: Math.min(GameConstants.PLAYER.MAX_ACCURACY, accuracy * GameConstants.SHOOTING.STANDING_ACCURACY_PENALTY)
                },
                shootingInterval: shootingInterval,
                currentShootingRound: null,
                shootingProgress: 0,
                shotsFired: 0,
                shootingResults: [],
                shootingStartTime: 0,
                
                // Штрафы
                penaltyMinutes: 0,
                penaltyLoops: 0,
                penaltyProgress: 0,
                totalMisses: 0,
                
                // Время
                raceTime: 0,
                shootingTime: 0,
                penaltyTime: 0,
                totalTime: 0,
                
                // Технические
                isPlayer: false,
                level: level,
                aggression: 0.5 + Math.random() * 0.5,
                consistency: 0.7 + Math.random() * 0.3,
                completedShootingRounds: [],
                justReturnedFromShooting: false
            });
        }
        
        console.log(`Сгенерировано ${opponents.length} ботов уровня ${minLevel}-${maxLevel}`);
        return opponents;
    }
    
    // Запуск гонки
    startRace() {
        if (this.isRacing) {
            console.warn("Гонка уже запущена!");
            return false;
        }
        
        this.isRacing = true;
        this.isPaused = false;
        this.raceStartTime = Date.now();
        this.lastUpdateTime = Date.now();
        
        // Применяем характеристики игрока
        this.applyPlayerCharacteristics();
        
        // Запускаем всех участников
        this.allCompetitors.forEach(competitor => {
            competitor.currentState = GameConstants.PLAYER_STATES.RACING;
            competitor.isRacing = true;
            competitor.raceStartTime = Date.now();
        });
        
        // Запускаем игровой цикл
        this.startGameLoop();
        
        console.log(`Гонка началась: ${this.race.name}`);
        console.log(`Участников: ${this.allCompetitors.length}`);
        return true;
    }
    
    // Основной игровой цикл
    startGameLoop() {
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
        }
        
        const updateGame = () => {
            if (!this.isRacing || this.isPaused) return;
            
            const currentTime = Date.now();
            const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
            this.lastUpdateTime = currentTime;
            
            // Обновляем всех участников
            this.allCompetitors.forEach(competitor => {
                if (!competitor.finished) {
                    this.updateCompetitor(competitor, deltaTime);
                }
            });
            
            // Обновляем позиции
            this.updatePositions();
            
            // Проверяем завершение гонки
            this.checkRaceCompletion();
            
            // Обновляем UI
            if (window.gameScreen) {
                window.gameScreen.updateDisplay();
            }
            
            // Следующий кадр
            this.gameLoopId = setTimeout(updateGame, GameConstants.UPDATE.INTERVAL);
        };
        
        updateGame();
    }
    
    // Обновление состояния участника
    updateCompetitor(competitor, deltaTime) {
        switch(competitor.currentState) {
            case GameConstants.PLAYER_STATES.RACING:
                this.updateRacingState(competitor, deltaTime);
                break;
            case GameConstants.PLAYER_STATES.SHOOTING:
                this.updateShootingState(competitor, deltaTime);
                break;
            case GameConstants.PLAYER_STATES.PENALTY_LOOP:
                this.updatePenaltyLoopState(competitor, deltaTime);
                break;
        }
        
        // Обновляем общее время
        competitor.totalTime = competitor.raceTime + competitor.shootingTime + competitor.penaltyTime;
    }
    
    // Обновление состояния гонки - ИСПРАВЛЕННАЯ ВЕРСИЯ С УСКОРЕНИЕМ
    updateRacingState(competitor, deltaTime) {
        // УСКОРЕНИЕ: умножаем deltaTime на множитель для быстрой гонки
        const acceleratedDeltaTime = deltaTime * GameConstants.RACE.TIME_MULTIPLIER;
        
        // Расчет скорости с учетом модификаторов
        const intensityModifier = GameConstants.INTENSITY_LEVELS[competitor.intensityLevel].speedModifier;
        const randomVariation = 1 + (Math.random() * 2 - 1) * GameConstants.RACE.RANDOM_VARIATION;
        const trackModifier = this.trackCondition;
        
        competitor.currentSpeedMps = competitor.baseSpeedMps * intensityModifier * randomVariation * trackModifier;
        
        // Пройденная дистанция (используем ускоренное время)
        const distanceThisFrame = competitor.currentSpeedMps * acceleratedDeltaTime;
        competitor.distanceCovered += distanceThisFrame;
        competitor.raceTime += acceleratedDeltaTime;
        
        // Обновляем прогресс круга
        const lapDistance = this.race.lapDistance;
        competitor.lapProgress = (competitor.distanceCovered % lapDistance) / lapDistance;
        competitor.currentLap = Math.floor(competitor.distanceCovered / lapDistance) + 1;
        
        // Проверяем завершение круга и стрельбу
        this.checkLapCompletion(competitor);
        this.checkShootingPoint(competitor);
        
        // Обновляем физиологию (используем ускоренное время)
        this.updatePhysiology(competitor, acceleratedDeltaTime);
    }
    
    // Обновление состояния стрельбы - БЕЗ УСКОРЕНИЯ
    updateShootingState(competitor, deltaTime) {
        competitor.shootingTime += deltaTime; // НЕ используем ускорение для стрельбы
        
        // Автоматическая стрельба
        if (competitor.shotsFired < 5) {
            const timeForNextShot = competitor.shootingInterval * (competitor.shotsFired + 1);
            if (competitor.shootingTime >= timeForNextShot) {
                this.makeShot(competitor);
            }
        }
        
        // Обновляем прогресс стрельбы
        competitor.shootingProgress = competitor.shotsFired / 5;
        
        // Завершение стрельбы
        if (competitor.shotsFired >= 5) {
            this.finishShooting(competitor);
        }
    }
    
    // Обновление состояния штрафных кругов - УСКОРЕННАЯ ВЕРСИЯ
    updatePenaltyLoopState(competitor, deltaTime) {
        const acceleratedDeltaTime = deltaTime * GameConstants.RACE.TIME_MULTIPLIER;
        competitor.penaltyTime += acceleratedDeltaTime;
        
        // Расчет скорости на штрафных кругах (медленнее)
        const penaltySpeed = competitor.baseSpeedMps * 0.8;
        const distanceThisFrame = penaltySpeed * acceleratedDeltaTime;
        
        // Обновляем прогресс штрафных кругов
        const totalPenaltyDistance = competitor.penaltyLoops * GameConstants.RACE.PENALTY_LOOP_LENGTH;
        competitor.penaltyProgress += distanceThisFrame / totalPenaltyDistance;
        
        // Завершение штрафных кругов
        if (competitor.penaltyProgress >= 1) {
            this.finishPenaltyLoops(competitor);
        }
    }
    
    // Проверка точки стрельбы
    checkShootingPoint(competitor) {
        const currentLap = competitor.currentLap;
        
        // Ищем стрельбу для текущего круга
        const shootingRound = this.race.shootingRounds.find(round => 
            round.afterLap === currentLap && 
            !competitor.completedShootingRounds.includes(round)
        );
        
        if (shootingRound && competitor.lapProgress >= 0.99) {
            // Завершаем круг и начинаем стрельбу
            competitor.lapProgress = 0;
            this.startShooting(competitor, shootingRound);
        }
    }
    
    // Проверка завершения круга
    checkLapCompletion(competitor) {
        if (competitor.lapProgress >= 1) {
            competitor.lapProgress = 0;
            competitor.currentLap++;
            
            console.log(`${competitor.name} завершил круг ${competitor.currentLap - 1}`);
            
            // Проверяем финиш
            if (competitor.currentLap > this.race.totalLaps) {
                this.finishCompetitor(competitor);
            }
        }
    }
    
    // Начало стрельбы
    startShooting(competitor, shootingRound) {
        competitor.currentState = GameConstants.PLAYER_STATES.SHOOTING;
        competitor.currentShootingRound = shootingRound;
        competitor.shootingResults = [];
        competitor.shotsFired = 0;
        competitor.shootingProgress = 0;
        competitor.shootingStartTime = Date.now();
        
        console.log(`${competitor.name} начинает стрельбу: ${shootingRound.name}`);
        
        // Используем ShootingEngine для управления стрельбой
        if (window.shootingEngine) {
            window.shootingEngine.startShooting(competitor, shootingRound);
        }
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }
    
    // Совершение выстрела
    makeShot(competitor) {
        if (competitor.shotsFired >= 5) {
            console.log("Все выстрелы уже произведены");
            return false;
        }

        // Расчет точности с учетом характеристик и условий
        const shootingRound = competitor.currentShootingRound;
        const baseAccuracy = competitor.shooting[shootingRound.position];
        const consistency = competitor.consistency || 0.8;
        
        // Расчет точности с учетом пульса
        const pulsePenalty = competitor.pulse > 140 ? 
            (competitor.pulse - 140) * GameConstants.PLAYER.PULSE_ACCURACY_PENALTY : 0;
        
        const effectiveAccuracy = Math.max(0.1, baseAccuracy * consistency - pulsePenalty);
        const isHit = Math.random() < effectiveAccuracy;

        competitor.shootingResults.push(isHit);
        competitor.shotsFired++;
        
        if (!isHit) {
            competitor.totalMisses++;
        }
        
        console.log(`${competitor.name}: выстрел ${competitor.shotsFired} - ${isHit ? 'ПОПАДАНИЕ' : 'ПРОМАХ'} (${Math.round(effectiveAccuracy * 100)}%)`);

        // Обновляем интерфейс
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }

        return isHit;
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
        competitor.currentShootingRound = null;
        competitor.shootingResults = [];
        competitor.shotsFired = 0;
        competitor.shootingProgress = 0;
        competitor.shootingStartTime = 0;
        
        // Определяем следующее состояние
        if (competitor.penaltyLoops > 0 && this.race.penaltyType === 'loops') {
            competitor.currentState = GameConstants.PLAYER_STATES.PENALTY_LOOP;
            competitor.penaltyProgress = 0;
            console.log(`${competitor.name} переходит к штрафным кругам: ${competitor.penaltyLoops} кругов`);
        } else {
            competitor.currentState = GameConstants.PLAYER_STATES.RACING;
            competitor.justReturnedFromShooting = true;
            console.log(`${competitor.name} возвращается к гонке`);
        }
        
        this.updatePositions();
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }
    
    // Применение штрафов за стрельбу
    applyShootingPenalty(competitor, misses) {
        if (this.race.penaltyType === 'minutes') {
            // Индивидуальная гонка - штрафные минуты
            competitor.penaltyMinutes += misses * (this.race.penaltyPerMiss || 60);
            console.log(`${competitor.name}: +${misses} минут штрафа`);
        } else {
            // Другие гонки - штрафные круги
            competitor.penaltyLoops += misses;
            console.log(`${competitor.name}: +${misses} штрафных кругов`);
        }
    }
    
    // Завершение штрафных кругов
    finishPenaltyLoops(competitor) {
        competitor.currentState = GameConstants.PLAYER_STATES.RACING;
        competitor.penaltyLoops = 0;
        competitor.penaltyProgress = 0;
        competitor.justReturnedFromShooting = true;
        
        // После штрафных кругов участник продолжает с начала текущего круга
        competitor.lapProgress = 0;
        
        console.log(`${competitor.name} завершил штрафные круги`);
        
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }
    
    // Завершение гонки для участника
    finishCompetitor(competitor) {
        competitor.finished = true;
        competitor.currentState = GameConstants.PLAYER_STATES.FINISHED;
        
        // Для индивидуальной гонки добавляем штрафные минуты
        if (this.race.penaltyType === 'minutes') {
            competitor.totalTime += competitor.penaltyMinutes;
        }
        
        console.log(`${competitor.name} финишировал! Время: ${this.formatTime(competitor.totalTime)}`);
    }
    
    // Обновление позиций
    updatePositions() {
        // Создаем временный массив для сортировки
        const tempCompetitors = [...this.allCompetitors];
        
        // Сортируем участников
        tempCompetitors.sort((a, b) => {
            // Сначала по финишу
            if (a.finished && !b.finished) return -1;
            if (!a.finished && b.finished) return 1;
            
            // Затем по дистанции (больше = лучше)
            if (a.distanceCovered !== b.distanceCovered) {
                return b.distanceCovered - a.distanceCovered;
            }
            
            // При равной дистанции - по общему времени (меньше = лучше)
            return a.totalTime - b.totalTime;
        });
        
        // Обновляем позиции
        tempCompetitors.forEach((competitor, index) => {
            competitor.position = index + 1;
        });
        
        // Сохраняем отсортированный массив
        this.allCompetitors = tempCompetitors;
    }
    
    // Обновление физиологии
    updatePhysiology(competitor, deltaTime) {
        // Изменение выносливости
        const staminaEffect = GameConstants.INTENSITY_LEVELS[competitor.intensityLevel].staminaEffect;
        competitor.stamina = Math.max(0, Math.min(GameConstants.PLAYER.MAX_STAMINA, 
            competitor.stamina + staminaEffect * deltaTime));
        
        // Изменение пульса
        if (competitor.intensityLevel >= 4) {
            competitor.pulse = Math.min(GameConstants.PLAYER.MAX_PULSE, 
                competitor.pulse + GameConstants.PLAYER.PULSE_INCREASE_RATE * deltaTime);
        } else {
            competitor.pulse = Math.max(GameConstants.PLAYER.MIN_PULSE, 
                competitor.pulse - GameConstants.PLAYER.PULSE_DECREASE_RATE * deltaTime);
        }
        
        // Автоматическое снижение интенсивности при низкой выносливости
        if (competitor.isPlayer) {
            this.applyStaminaRestrictions(competitor);
        }
    }
    
    // Применение ограничений по выносливости
    applyStaminaRestrictions(competitor) {
        const restrictions = GameConstants.STAMINA_RESTRICTIONS;
        const currentStamina = competitor.stamina;
        
        if (competitor.intensityLevel >= 7 && currentStamina < restrictions[7]) {
            competitor.intensityLevel = 6;
            console.log("Автоматическое снижение: спринт недоступен");
        } else if (competitor.intensityLevel >= 6 && currentStamina < restrictions[6]) {
            competitor.intensityLevel = 5;
            console.log("Автоматическое снижение: очень быстрый недоступен");
        } else if (competitor.intensityLevel >= 5 && currentStamina < restrictions[5]) {
            competitor.intensityLevel = 4;
            console.log("Автоматическое снижение: быстрый недоступен");
        }
    }
    
    // Проверка завершения гонки
    checkRaceCompletion() {
        const allFinished = this.allCompetitors.every(competitor => competitor.finished);
        
        if (allFinished) {
            this.finishRace();
        }
    }
    
    // Завершение гонки
    finishRace() {
        this.isRacing = false;
        
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
            this.gameLoopId = null;
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
            const time = this.player.totalTime;
            const stats = window.playerProfile ? window.playerProfile.getAllStats() : {};
            
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
    }
    
    // Управление интенсивностью
    setIntensityLevel(competitor, level) {
        if (level < 1 || level > 7) return false;
        
        // Проверяем ограничения по выносливости
        const restrictions = GameConstants.STAMINA_RESTRICTIONS;
        if (restrictions[level] && competitor.stamina < restrictions[level]) {
            console.log(`Недостаточно выносливости для уровня ${level}`);
            return false;
        }
        
        competitor.intensityLevel = level;
        console.log(`${competitor.name} переключился на уровень: ${GameConstants.INTENSITY_LEVELS[level].name}`);
        return true;
    }
    
    // Активация спринта (уровень 7)
    activateSprint() {
        return this.setIntensityLevel(this.player, 7);
    }
    
    // Активация медленного темпа (уровень 2)
    activateSlowPace() {
        return this.setIntensityLevel(this.player, 2);
    }
    
    // Пауза гонки
    pauseRace() {
        if (!this.isRacing || this.isPaused) return;
        
        this.isPaused = true;
        console.log("Гонка приостановлена");
        
        if (window.gameScreen) {
            window.gameScreen.showMessage("⏸️ Гонка приостановлена", "info");
        }
    }
    
    // Продолжение гонки
    resumeRace() {
        if (!this.isRacing || !this.isPaused) return;
        
        this.isPaused = false;
        this.lastUpdateTime = Date.now();
        console.log("Гонка продолжена");
        
        if (window.gameScreen) {
            window.gameScreen.showMessage("▶️ Гонка продолжена", "info");
        }
    }
    
    // Применение характеристик игрока
    applyPlayerCharacteristics() {
        if (window.playerProfile && this.player) {
            window.playerProfile.applyToGamePlayer(this.player);
        }
    }
    
    // НОВЫЙ МЕТОД: Получить результаты стрельбы для отображения
    getShootingResults(competitor) {
        if (!competitor) return { hits: 0, misses: 0, shots: [] };
        
        const hits = competitor.shootingResults ? 
            competitor.shootingResults.filter(result => result).length : 0;
        const misses = competitor.shootingResults ? 
            competitor.shootingResults.filter(result => !result).length : 0;
        
        return {
            hits: hits,
            misses: misses,
            shots: competitor.shootingResults || []
        };
    }
    
    // НОВЫЙ МЕТОД: Получить значение штрафа для отображения
    getPenaltyDisplayValue(competitor) {
        if (!this.race) return 0;
        
        if (this.race.penaltyType === 'minutes') {
            return competitor.penaltyMinutes > 0 ? '+' + (competitor.penaltyMinutes / 60).toFixed(1) + 'м' : '';
        } else {
            return competitor.penaltyLoops > 0 ? competitor.penaltyLoops : '';
        }
    }
    
    // НОВЫЙ МЕТОД: Получить отставание игрока
    getPlayerGap(competitor) {
        const leader = this.allCompetitors[0];
        return competitor.totalTime - leader.totalTime;
    }
    
    // Вспомогательные методы
    calculateSpeedFromLevel(level) {
        return GameConstants.PLAYER.MIN_SPEED + (level / 60) * (GameConstants.PLAYER.MAX_SPEED - GameConstants.PLAYER.MIN_SPEED);
    }
    
    calculateShootingInterval(level) {
        return GameConstants.SHOOTING.MAX_SHOOTING_INTERVAL - (level / 60) * 
               (GameConstants.SHOOTING.MAX_SHOOTING_INTERVAL - GameConstants.SHOOTING.MIN_SHOOTING_INTERVAL);
    }
    
    getRandomWind() {
        return this.windConditions[Math.floor(Math.random() * this.windConditions.length)];
    }
    
    formatTime(seconds) {
        if (seconds < 0) return '0:00.0';
        
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins}:${secs.padStart(4, '0')}`;
    }
    
    // Геттеры
    getCurrentRace() {
        return this.race;
    }
    
    // Возврат в меню
    returnToMenu() {
        this.isRacing = false;
        this.isPaused = false;
        
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
            this.gameLoopId = null;
        }
        
        console.log("Возврат в главное меню");
        return true;
    }
}
