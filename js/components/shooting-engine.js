// js/components/shooting-engine.js
class ShootingEngine {
    constructor() {
        this.isActive = false;
        this.currentShooter = null;
        this.shootingTimers = new Map();
        this.windConditions = ["Слабый ветер", "Умеренный ветер", "Сильный ветер"];
        
        console.log("ShootingEngine инициализирован для непрерывной системы");
    }

    // Начать стрельбу для участника
    startShooting(competitor, shootingRound) {
        if (!competitor || !shootingRound) {
            console.error("Неверные параметры для начала стрельбы");
            return false;
        }

        this.isActive = true;
        this.currentShooter = competitor;
        
        // Сбрасываем состояние стрельбы
        competitor.shootingResults = [];
        competitor.shotsFired = 0;
        competitor.shootingProgress = 0;
        competitor.shootingStartTime = Date.now();
        competitor.currentShootingRound = shootingRound;

        console.log(`🎯 ${competitor.name} начинает стрельбу: ${shootingRound.name}`);

        // Запускаем автоматическую стрельбу
        this.startAutomaticShooting(competitor);

        // Обновляем интерфейс
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }

        return true;
    }

    // Запуск автоматической стрельбы
    startAutomaticShooting(competitor) {
        const shootingInterval = competitor.shootingInterval * 1000; // в миллисекундах
        
        // Очищаем предыдущие таймеры
        this.clearShootingTimers(competitor);
        
        const timers = [];
        
        for (let i = 0; i < 5; i++) {
            const timer = setTimeout(() => {
                if (competitor.currentState === GameConstants.PLAYER_STATES.SHOOTING && 
                    competitor.shotsFired === i) {
                    this.makeShot(competitor);
                }
            }, (i + 1) * shootingInterval);
            
            timers.push(timer);
        }
        
        this.shootingTimers.set(competitor.id, timers);
    }

    // Произвести выстрел
    makeShot(competitor) {
        if (competitor.shotsFired >= 5) {
            console.log("Все выстрелы уже произведены");
            return false;
        }

        // Расчет точности с учетом характеристик и условий
        const accuracy = this.calculateShotAccuracy(competitor);
        const isHit = Math.random() < accuracy;

        // Записываем результат
        competitor.shootingResults.push(isHit);
        competitor.shotsFired++;
        competitor.shootingProgress = competitor.shotsFired / 5;

        if (!isHit) {
            competitor.totalMisses++;
        }

        console.log(`${competitor.name}: выстрел ${competitor.shotsFired} - ${isHit ? 'ПОПАДАНИЕ' : 'ПРОМАХ'} (${Math.round(accuracy * 100)}%)`);

        // Обновляем интерфейс
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }

        // Если все выстрелы произведены, завершаем стрельбу
        if (competitor.shotsFired >= 5) {
            this.finishShooting(competitor);
        }

        return isHit;
    }

    // Расчет точности выстрела
    calculateShotAccuracy(competitor) {
        if (!competitor.currentShootingRound) {
            console.error("Нет данных о текущей стрельбе");
            return 0.5;
        }

        const shootingRound = competitor.currentShootingRound;
        const position = shootingRound.position;
        
        // Базовая точность из характеристик
        let baseAccuracy = competitor.shooting[position] || 0.5;
        
        // Модификаторы положения
        if (position === 'prone') {
            baseAccuracy *= GameConstants.SHOOTING.PRONE_ACCURACY_BONUS;
        } else {
            baseAccuracy *= GameConstants.SHOOTING.STANDING_ACCURACY_PENALTY;
        }

        // Влияние пульса
        const pulsePenalty = competitor.pulse > 140 ? 
            (competitor.pulse - 140) * GameConstants.PLAYER.PULSE_ACCURACY_PENALTY : 0;
        
        // Влияние ветра
        const windModifier = this.calculateWindModifier();
        
        // Случайный фактор (±10%)
        const randomVariation = 1 + (Math.random() * 0.2 - 0.1);

        // Итоговая точность
        let finalAccuracy = Math.max(
            GameConstants.PLAYER.MIN_ACCURACY,
            Math.min(
                GameConstants.PLAYER.MAX_ACCURACY,
                (baseAccuracy - pulsePenalty) * windModifier * randomVariation
            )
        );

        return finalAccuracy;
    }

    // Расчет модификатора ветра
    calculateWindModifier() {
        if (!window.biathlonGame) return 1.0;
        
        const wind = window.biathlonGame.currentWind || "Слабый ветер";
        
        switch(wind) {
            case "Сильный ветер":
                return 0.8; // -20% к точности
            case "Умеренный ветер":
                return 0.9; // -10% к точности
            case "Слабый ветер":
                return 0.95; // -5% к точности
            default:
                return 1.0;
        }
    }

    // Завершение стрельбы
    finishShooting(competitor) {
        if (!competitor.currentShootingRound) {
            console.error("Нет активной стрельбы для завершения");
            return false;
        }

        const misses = competitor.shootingResults.filter(result => !result).length;
        const hits = 5 - misses;

        console.log(`✅ ${competitor.name} завершил стрельбу: ${hits}/5 попаданий`);

        // Применяем штрафы
        this.applyPenalties(competitor, misses);

        // Отмечаем завершенную стрельбу
        competitor.completedShootingRounds.push(competitor.currentShootingRound);

        // Сбрасываем состояние стрельбы
        competitor.currentShootingRound = null;
        competitor.shootingResults = [];
        competitor.shotsFired = 0;
        competitor.shootingProgress = 0;

        // Очищаем таймеры
        this.clearShootingTimers(competitor);

        // Определяем следующее состояние
        this.determineNextState(competitor);

        this.isActive = false;
        this.currentShooter = null;

        return true;
    }

    // Применение штрафов за промахи
    applyPenalties(competitor, misses) {
        if (misses === 0) return;

        const game = window.biathlonGame;
        if (!game || !game.race) {
            console.error("Нет данных о текущей гонке");
            return;
        }

        const race = game.race;

        if (race.penaltyType === 'minutes') {
            // Индивидуальная гонка - штрафные минуты
            competitor.penaltyMinutes += misses * (race.penaltyPerMiss || 60);
            console.log(`⏰ ${competitor.name}: +${misses} минут штрафа`);
        } else {
            // Другие гонки - штрафные круги
            competitor.penaltyLoops += misses;
            console.log(`⏱️ ${competitor.name}: +${misses} штрафных кругов`);
        }
    }

    // Определение следующего состояния после стрельбы
    determineNextState(competitor) {
        const game = window.biathlonGame;
        if (!game) return;

        if (competitor.penaltyLoops > 0 && game.race.penaltyType === 'loops') {
            // Переход к штрафным кругам
            competitor.currentState = GameConstants.PLAYER_STATES.PENALTY_LOOP;
            competitor.penaltyProgress = 0;
            console.log(`🔄 ${competitor.name} переходит к штрафным кругам`);
        } else {
            // Возврат к гонке
            competitor.currentState = GameConstants.PLAYER_STATES.RACING;
            competitor.justReturnedFromShooting = true;
            console.log(`🏃 ${competitor.name} возвращается к гонке`);
        }

        // Обновляем позиции
        if (game.updatePositions) {
            game.updatePositions();
        }

        // Обновляем интерфейс
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }

    // Очистка таймеров стрельбы
    clearShootingTimers(competitor) {
        const competitorId = competitor.id || competitor.name;
        const timers = this.shootingTimers.get(competitorId);
        
        if (timers) {
            timers.forEach(timer => clearTimeout(timer));
            this.shootingTimers.delete(competitorId);
        }
    }

    // Принудительная остановка стрельбы
    stopShooting(competitor) {
        if (!competitor) return;

        console.log(`🛑 Принудительная остановка стрельбы для ${competitor.name}`);

        // Очищаем таймеры
        this.clearShootingTimers(competitor);

        // Сбрасываем состояние
        if (competitor.currentShootingRound) {
            competitor.completedShootingRounds.push(competitor.currentShootingRound);
        }
        
        competitor.currentShootingRound = null;
        competitor.shootingResults = [];
        competitor.shotsFired = 0;
        competitor.shootingProgress = 0;

        // Возвращаем к гонке
        competitor.currentState = GameConstants.PLAYER_STATES.RACING;
        competitor.justReturnedFromShooting = true;

        this.isActive = false;
        this.currentShooter = null;

        // Обновляем интерфейс
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }

    // Получить текущий прогресс стрельбы
    getShootingProgress(competitor) {
        if (!competitor || competitor.currentState !== GameConstants.PLAYER_STATES.SHOOTING) {
            return {
                active: false,
                progress: 0,
                shotsFired: 0,
                hits: 0,
                misses: 0
            };
        }

        const hits = competitor.shootingResults.filter(result => result).length;
        const misses = competitor.shootingResults.filter(result => !result).length;

        return {
            active: true,
            progress: competitor.shootingProgress,
            shotsFired: competitor.shotsFired,
            hits: hits,
            misses: misses,
            round: competitor.currentShootingRound
        };
    }

    // Получить случайные условия ветра
    getRandomWind() {
        return this.windConditions[Math.floor(Math.random() * this.windConditions.length)];
    }

    // Проверка, активна ли стрельба для участника
    isShootingActive(competitor) {
        return this.isActive && 
               this.currentShooter === competitor && 
               competitor.currentState === GameConstants.PLAYER_STATES.SHOOTING;
    }

    // Получить информацию о текущей стрельбе
    getCurrentShootingInfo() {
        if (!this.currentShooter) return null;

        return {
            shooter: this.currentShooter,
            round: this.currentShooter.currentShootingRound,
            progress: this.getShootingProgress(this.currentShooter)
        };
    }

    // Очистка всех ресурсов
    cleanup() {
        // Очищаем все таймеры
        this.shootingTimers.forEach((timers, competitorId) => {
            timers.forEach(timer => clearTimeout(timer));
        });
        this.shootingTimers.clear();
        
        this.isActive = false;
        this.currentShooter = null;
        
        console.log("ShootingEngine очищен");
    }
}
