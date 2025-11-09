class PlayerProfile {
    constructor() {
        // Базовые характеристики игрока - начинаем с 0
        this.stats = {
            runningSpeed: 0,    // Влияет на базовую скорость (от 4.44 до 7.78 м/с)
            accuracy: 0,        // Влияет на точность стрельбы (от 50% до 95%)
            shootingSpeed: 0,   // Влияет на время между выстрелами (от 6 до 3 секунд)
            stamina: 0          // Влияет на максимальную выносливость (от 60 до 150)
        };
        
        // Очки для распределения
        this.availablePoints = GameConstants.STATS.STARTING_POINTS;
        
        // Минимальные и максимальные значения характеристик
        this.minValues = {
            runningSpeed: GameConstants.STATS.MIN_RUNNING_SPEED,
            accuracy: GameConstants.STATS.MIN_ACCURACY,
            shootingSpeed: GameConstants.STATS.MIN_SHOOTING_SPEED,
            stamina: GameConstants.STATS.MIN_STAMINA
        };
        
        this.maxValues = {
            runningSpeed: GameConstants.STATS.MAX_RUNNING_SPEED,
            accuracy: GameConstants.STATS.MAX_ACCURACY,
            shootingSpeed: GameConstants.STATS.MAX_SHOOTING_SPEED,
            stamina: GameConstants.STATS.MAX_STAMINA
        };
        
        // Стоимость улучшения
        this.upgradeCosts = {
            runningSpeed: 1,
            accuracy: 1,
            shootingSpeed: 1,
            stamina: 1
        };
        
        // Экипировка (будет добавляться позже)
        this.equipment = {
            skis: { level: 1, speedBonus: 0 },
            rifle: { level: 1, accuracyBonus: 0, shootingSpeedBonus: 0 },
            suit: { level: 1, staminaBonus: 0 }
        };
        
        // Загружаем сохраненные данные
        this.loadFromStorage();
        
        console.log("PlayerProfile инициализирован с новой системой:", this.stats);
    }
    
    // Увеличить характеристику
    increaseStat(statName) {
        if (!this.stats.hasOwnProperty(statName)) {
            console.error("Неизвестная характеристика:", statName);
            return false;
        }
        
        if (this.availablePoints <= 0) {
            console.log("Недостаточно очков для улучшения");
            return false;
        }
        
        const currentValue = this.stats[statName];
        const maxValue = this.maxValues[statName];
        const cost = this.upgradeCosts[statName];
        
        if (currentValue >= maxValue) {
            console.log(`Характеристика ${statName} уже максимальная`);
            return false;
        }
        
        if (this.availablePoints < cost) {
            console.log("Недостаточно очков для этого улучшения");
            return false;
        }
        
        // Увеличиваем характеристику на 1 уровень
        this.stats[statName] = currentValue + 1;
        this.availablePoints -= cost;
        
        console.log(`Улучшена ${statName}: ${currentValue} → ${this.stats[statName]}, осталось очков: ${this.availablePoints}`);
        
        // Сохраняем и обновляем UI
        this.saveToStorage();
        this.updateUI();
        
        return true;
    }
    
    // Уменьшить характеристику
    decreaseStat(statName) {
        if (!this.stats.hasOwnProperty(statName)) {
            console.error("Неизвестная характеристика:", statName);
            return false;
        }
        
        const currentValue = this.stats[statName];
        const minValue = this.minValues[statName];
        
        if (currentValue <= minValue) {
            console.log(`Характеристика ${statName} уже минимальная`);
            return false;
        }
        
        const cost = this.upgradeCosts[statName];
        
        // Уменьшаем характеристику на 1 уровень
        this.stats[statName] = currentValue - 1;
        this.availablePoints += cost;
        
        console.log(`Уменьшена ${statName}: ${currentValue} → ${this.stats[statName]}, доступно очков: ${this.availablePoints}`);
        
        // Сохраняем и обновляем UI
        this.saveToStorage();
        this.updateUI();
        
        return true;
    }
    
    // Сбросить все характеристики
    resetStats() {
        this.stats = {
            runningSpeed: 0,
            accuracy: 0,
            shootingSpeed: 0,
            stamina: 0
        };
        
        this.availablePoints = GameConstants.STATS.STARTING_POINTS;
        
        console.log("Характеристики сброшены, доступно очков:", this.availablePoints);
        
        this.saveToStorage();
        this.updateUI();
        
        return true;
    }
    
    // === РАСЧЕТНЫЕ ХАРАКТЕРИСТИКИ ===
    
    // Получить базовую скорость в м/с (от 4.44 до 7.78 м/с)
    getBaseSpeedMps() {
        const level = this.stats.runningSpeed;
        const minSpeed = GameConstants.PLAYER.MIN_SPEED;
        const maxSpeed = GameConstants.PLAYER.MAX_SPEED;
        
        return minSpeed + (level * (maxSpeed - minSpeed) / 60);
    }
    
    // Получить время между выстрелами в секундах (от 6 до 3 секунд)
    getShotInterval() {
        const level = this.stats.shootingSpeed;
        const minInterval = GameConstants.SHOOTING.MIN_SHOOTING_INTERVAL;
        const maxInterval = GameConstants.SHOOTING.MAX_SHOOTING_INTERVAL;
        
        return maxInterval - (level * (maxInterval - minInterval) / 60);
    }
    
    // Получить точность стрельбы (от 0.5 до 0.95)
    getShootingAccuracy(position) {
        const level = this.stats.accuracy;
        const minAccuracy = GameConstants.PLAYER.MIN_ACCURACY;
        const maxAccuracy = GameConstants.PLAYER.MAX_ACCURACY;
        
        const baseAccuracy = minAccuracy + (level * (maxAccuracy - minAccuracy) / 60);
        
        // Модификатор для разных положений
        if (position === 'prone') {
            return Math.min(maxAccuracy, baseAccuracy * GameConstants.SHOOTING.PRONE_ACCURACY_BONUS);
        } else { // standing
            return Math.min(maxAccuracy, baseAccuracy * GameConstants.SHOOTING.STANDING_ACCURACY_PENALTY);
        }
    }
    
    // Получить максимальную выносливость
    getMaxStamina() {
        const level = this.stats.stamina;
        const minStamina = 60;
        const maxStamina = 150;
        
        return minStamina + (level * (maxStamina - minStamina) / 60);
    }
    
    // Получить общий уровень игрока
    getPlayerLevel() {
        return Math.max(
            this.stats.runningSpeed,
            this.stats.accuracy,
            this.stats.shootingSpeed,
            this.stats.stamina
        );
    }
    
    // Получить расчетное время прохождения круга (в секундах)
    getLapTime(lapDistance = 3000) {
        const speedMps = this.getBaseSpeedMps();
        return lapDistance / speedMps;
    }
    
    // Получить расчетное время стрельбы (5 выстрелов)
    getShootingTime() {
        const shotInterval = this.getShotInterval();
        return shotInterval * 5; // Общее время стрельбы
    }
    
    // Получить расчетное время штрафного круга
    getPenaltyLoopTime() {
        const speedMps = this.getBaseSpeedMps() * 0.8; // Медленнее на штрафных
        const penaltyDistance = GameConstants.RACE.PENALTY_LOOP_LENGTH;
        return penaltyDistance / speedMps;
    }
    
    // === ИНФОРМАЦИЯ ДЛЯ ОТОБРАЖЕНИЯ ===
    
    // Получить значение характеристики
    getStat(statName) {
        return this.stats[statName] || 0;
    }
    
    // Получить все характеристики
    getAllStats() {
        return { ...this.stats };
    }
    
    // Получить доступные очки
    getAvailablePoints() {
        return this.availablePoints;
    }
    
    // Получить форматированное значение для отображения
    getFormattedStat(statName) {
        const value = this.stats[statName];
        
        switch(statName) {
            case 'runningSpeed':
                const speedMps = this.getBaseSpeedMps();
                const speedKmh = (speedMps * 3.6).toFixed(1);
                return `${speedKmh} км/ч (${value}/60)`;
                
            case 'accuracy':
                const proneAccuracy = this.getShootingAccuracy('prone');
                const standingAccuracy = this.getShootingAccuracy('standing');
                return `Лёжа: ${Math.round(proneAccuracy * 100)}%, Стоя: ${Math.round(standingAccuracy * 100)}%`;
                
            case 'shootingSpeed':
                const interval = this.getShotInterval();
                return `${interval.toFixed(1)}с (${value}/60)`;
                
            case 'stamina':
                const maxStamina = this.getMaxStamina();
                return `${maxStamina} (${value}/60)`;
                
            default:
                return value.toString();
        }
    }
    
    // Получить информацию о прогрессе для отображения
    getProgressInfo() {
        const lapTime = this.getLapTime(3000); // для среднего круга 3000м
        const shootingTime = this.getShootingTime();
        const penaltyTime = this.getPenaltyLoopTime();
        
        return {
            // Основные показатели
            speed: (this.getBaseSpeedMps() * 3.6).toFixed(1) + ' км/ч',
            lapTime: this.formatTime(lapTime),
            shootingTime: this.formatTime(shootingTime),
            penaltyTime: this.formatTime(penaltyTime),
            
            // Точность
            accuracyProne: (this.getShootingAccuracy('prone') * 100).toFixed(1) + '%',
            accuracyStanding: (this.getShootingAccuracy('standing') * 100).toFixed(1) + '%',
            
            // Выносливость
            maxStamina: this.getMaxStamina().toFixed(0),
            
            // Уровень
            totalLevel: this.getPlayerLevel(),
            
            // Расчетное время для разных гонок
            sprintTime: this.formatTime(this.calculateRaceTime('sprint')),
            pursuitTime: this.formatTime(this.calculateRaceTime('pursuit')),
            massTime: this.formatTime(this.calculateRaceTime('mass')),
            individualTime: this.formatTime(this.calculateRaceTime('individual'))
        };
    }
    
    // Расчет времени для конкретной гонки
    calculateRaceTime(raceType) {
        const race = GameConstants.RACE_TYPES[raceType.toUpperCase()];
        if (!race) return 0;
        
        // Время гонки = время на трассе + время стрельбы
        const lapTime = this.getLapTime(race.lapDistance);
        const shootingTime = this.getShootingTime();
        
        // Общее время на круги
        const totalLapTime = lapTime * race.totalLaps;
        
        // Время стрельбы (все стрельбы)
        const totalShootingTime = shootingTime * race.shootingRounds.length;
        
        // Добавляем 10% на случайные факторы
        return (totalLapTime + totalShootingTime) * 1.1;
    }
    
    // Форматирование времени
    formatTime(seconds) {
        if (seconds < 60) {
            return seconds.toFixed(1) + 'с';
        }
        
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins}:${secs.padStart(4, '0')}`;
    }
    
    // Проверить, можно ли увеличить характеристику
    canIncrease(statName) {
        return this.availablePoints >= this.upgradeCosts[statName] && 
               this.stats[statName] < this.maxValues[statName];
    }
    
    // Проверить, можно ли уменьшить характеристику
    canDecrease(statName) {
        return this.stats[statName] > this.minValues[statName];
    }
    
    // Обновить интерфейс
    updateUI() {
        if (window.characterScreen && typeof window.characterScreen.updateStatsDisplay === 'function') {
            window.characterScreen.updateStatsDisplay();
        }
    }
    
    // Сохранить в localStorage
    saveToStorage() {
        try {
            const saveData = {
                stats: this.stats,
                availablePoints: this.availablePoints,
                equipment: this.equipment,
                version: '3.0',
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(GameConstants.STORAGE_KEYS.PLAYER_PROFILE, JSON.stringify(saveData));
            console.log("Данные игрока сохранены");
        } catch (error) {
            console.error("Ошибка сохранения данных:", error);
        }
    }
    
    // Загрузить из localStorage
    loadFromStorage() {
        try {
            const savedData = localStorage.getItem(GameConstants.STORAGE_KEYS.PLAYER_PROFILE);
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Поддержка разных версий
                if (data.version === '3.0') {
                    this.stats = { ...this.stats, ...data.stats };
                    this.availablePoints = data.availablePoints || this.availablePoints;
                    this.equipment = data.equipment || this.equipment;
                    console.log("Данные игрока загружены (v3.0):", this.stats);
                } else if (data.version === '1.0' || data.version === '2.0') {
                    // Миграция со старых версий
                    this.migrateFromOldVersion(data);
                } else {
                    // Старый формат без версии
                    this.stats = data.stats || data || this.stats;
                    this.availablePoints = data.availablePoints || this.availablePoints;
                    console.log("Данные игрока загружены (старый формат):", this.stats);
                    this.saveToStorage(); // Сохраняем в новом формате
                }
            }
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        }
    }
    
    // Миграция данных со старых версий
    migrateFromOldVersion(oldData) {
        console.log("Миграция данных игрока со старой версии...");
        
        this.stats = oldData.stats || this.stats;
        this.availablePoints = oldData.availablePoints || this.availablePoints;
        
        // Сохраняем в новом формате
        this.saveToStorage();
        console.log("Миграция завершена:", this.stats);
    }
    
    // Применить характеристики к игроку в гонке
    applyToGamePlayer(gamePlayer) {
        if (!gamePlayer) {
            console.error("Не передан объект игрока для применения характеристик");
            return;
        }
        
        // Базовая скорость в м/с
        gamePlayer.baseSpeedMps = this.getBaseSpeedMps();
        gamePlayer.currentSpeedMps = gamePlayer.baseSpeedMps;
        
        // Выносливость
        gamePlayer.maxStamina = this.getMaxStamina();
        gamePlayer.stamina = gamePlayer.maxStamina;
        
        // Меткость для разных положений
        gamePlayer.shooting = {
            prone: this.getShootingAccuracy('prone'),
            standing: this.getShootingAccuracy('standing')
        };
        
        // Скорость стрельбы (интервал между выстрелами в секундах)
        gamePlayer.shootingInterval = this.getShotInterval();
        
        // Уровень для отображения
        gamePlayer.level = this.getPlayerLevel();
        
        // Расчетные показатели для отладки
        const progressInfo = this.getProgressInfo();
        
        console.log("Характеристики применены к игроку:", {
            speed: `${gamePlayer.baseSpeedMps.toFixed(2)} м/с (${(gamePlayer.baseSpeedMps * 3.6).toFixed(1)} км/ч)`,
            shootingInterval: `${gamePlayer.shootingInterval.toFixed(1)}с`,
            accuracyProne: `${(gamePlayer.shooting.prone * 100).toFixed(1)}%`,
            accuracyStanding: `${(gamePlayer.shooting.standing * 100).toFixed(1)}%`,
            stamina: `${gamePlayer.stamina}/${gamePlayer.maxStamina}`,
            playerLevel: gamePlayer.level,
            lapTime: progressInfo.lapTime,
            shootingTime: progressInfo.shootingTime
        });
        
        return true;
    }
    
    // Получить информацию о рекомендуемых характеристиках для гонки
    getRecommendedStats(raceType) {
        if (!window.raceManager) {
            return this.getDefaultRecommendedStats(raceType);
        }
        
        return window.raceManager.getRecommendedStats(raceType);
    }
    
    // Базовые рекомендации (если RaceManager не доступен)
    getDefaultRecommendedStats(raceType) {
        const baseRecommendations = {
            sprint: { runningSpeed: 20, accuracy: 25, shootingSpeed: 15, stamina: 20 },
            pursuit: { runningSpeed: 25, accuracy: 30, shootingSpeed: 20, stamina: 25 },
            mass: { runningSpeed: 30, accuracy: 35, shootingSpeed: 25, stamina: 30 },
            individual: { runningSpeed: 35, accuracy: 40, shootingSpeed: 30, stamina: 35 }
        };
        
        return baseRecommendations[raceType] || baseRecommendations.sprint;
    }
    
    // Получить эффективность для текущих характеристик
    getEfficiencyForRace(raceType) {
        const recommended = this.getRecommendedStats(raceType);
        const current = this.stats;
        
        let efficiency = 0;
        let totalWeight = 0;
        
        // Бег (вес 40%)
        if (recommended.runningSpeed > 0) {
            const runningEff = Math.min(1, current.runningSpeed / recommended.runningSpeed);
            efficiency += runningEff * 0.4;
            totalWeight += 0.4;
        }
        
        // Точность (вес 30%)
        if (recommended.accuracy > 0) {
            const accuracyEff = Math.min(1, current.accuracy / recommended.accuracy);
            efficiency += accuracyEff * 0.3;
            totalWeight += 0.3;
        }
        
        // Скорость стрельбы (вес 20%)
        if (recommended.shootingSpeed > 0) {
            const shootingEff = Math.min(1, current.shootingSpeed / recommended.shootingSpeed);
            efficiency += shootingEff * 0.2;
            totalWeight += 0.2;
        }
        
        // Выносливость (вес 10%)
        if (recommended.stamina > 0) {
            const staminaEff = Math.min(1, current.stamina / recommended.stamina);
            efficiency += staminaEff * 0.1;
            totalWeight += 0.1;
        }
        
        // Нормализуем эффективность
        efficiency = totalWeight > 0 ? efficiency / totalWeight : 0;
        
        return {
            efficiency: efficiency,
            percentage: Math.round(efficiency * 100),
            description: this.getEfficiencyDescription(efficiency)
        };
    }
    
    // Получить описание эффективности
    getEfficiencyDescription(efficiency) {
        if (efficiency >= 0.9) return "Отличная подготовка";
        if (efficiency >= 0.7) return "Хорошая подготовка";
        if (efficiency >= 0.5) return "Средняя подготовка";
        if (efficiency >= 0.3) return "Слабая подготовка";
        return "Недостаточная подготовка";
    }
    
    // === МЕТОДЫ ДЛЯ БУДУЩЕЙ СИСТЕМЫ ЭКИПИРОВКИ ===
    
    // Улучшить экипировку
    upgradeEquipment(type) {
        if (!this.equipment[type]) {
            console.error("Неизвестный тип экипировки:", type);
            return false;
        }
        
        // TODO: Реализовать систему улучшения экипировки
        console.log(`Улучшение экипировки: ${type}`);
        return true;
    }
    
    // Получить бонусы от экипировки
    getEquipmentBonuses() {
        return {
            speedBonus: this.equipment.skis.speedBonus,
            accuracyBonus: this.equipment.rifle.accuracyBonus,
            shootingSpeedBonus: this.equipment.rifle.shootingSpeedBonus,
            staminaBonus: this.equipment.suit.staminaBonus
        };
    }
    
    // Рассчитать общие характеристики с учетом экипировки
    getTotalStats() {
        const baseStats = this.getAllStats();
        const equipmentBonuses = this.getEquipmentBonuses();
        
        return {
            runningSpeed: baseStats.runningSpeed + equipmentBonuses.speedBonus,
            accuracy: baseStats.accuracy + equipmentBonuses.accuracyBonus,
            shootingSpeed: baseStats.shootingSpeed + equipmentBonuses.shootingSpeedBonus,
            stamina: baseStats.stamina + equipmentBonuses.staminaBonus
        };
    }
    
    // Экспорт данных игрока
    exportData() {
        return {
            stats: this.stats,
            availablePoints: this.availablePoints,
            equipment: this.equipment,
            progressInfo: this.getProgressInfo(),
            version: '3.0',
            exportedAt: new Date().toISOString()
        };
    }
    
    // Импорт данных игрока
    importData(data) {
        try {
            if (data.stats && data.availablePoints !== undefined) {
                this.stats = data.stats;
                this.availablePoints = data.availablePoints;
                this.equipment = data.equipment || this.equipment;
                
                this.saveToStorage();
                this.updateUI();
                
                console.log("Данные игрока импортированы");
                return true;
            }
        } catch (error) {
            console.error("Ошибка импорта данных:", error);
        }
        
        return false;
    }
}
