class PlayerProfile {
    constructor() {
        // Базовые характеристики игрока - начинаем с 0
        this.stats = {
            runningSpeed: 0,    // Влияет на скорость в м/с (от 2.78 до 5 м/с)
            accuracy: 0,        // Влияет на точность стрельбы (от 10% до 95%)
            shootingSpeed: 0,   // Влияет на время между выстрелами (от 6 до 3 секунд)
            stamina: 0          // Влияет на максимальную выносливость (от 60 до 150)
        };
        
        // Очки для распределения
        this.availablePoints = 60;
        
        // Минимальные и максимальные значения характеристик
        this.minValues = {
            runningSpeed: 0,
            accuracy: 0,
            shootingSpeed: 0,
            stamina: 0
        };
        
        this.maxValues = {
            runningSpeed: 60,
            accuracy: 60,
            shootingSpeed: 60,
            stamina: 60
        };
        
        // Стоимость улучшения
        this.upgradeCosts = {
            runningSpeed: 1,
            accuracy: 1,
            shootingSpeed: 1,
            stamina: 1
        };
        
        // Загружаем сохраненные данные
        this.loadFromStorage();
        
        console.log("PlayerProfile инициализирован:", this.stats);
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
        
        this.availablePoints = 60;
        
        console.log("Характеристики сброшены, доступно очков:", this.availablePoints);
        
        this.saveToStorage();
        this.updateUI();
        
        return true;
    }
    
    // Получить скорость в м/с (от 2.78 до 5 м/с)
    getSpeedMps() {
        const level = this.stats.runningSpeed;
        // От 10 км/ч (2.78 м/с) до 18 км/ч (5 м/с)
        return 2.78 + (level * (5 - 2.78) / 60);
    }
    
    // Получить время между выстрелами в секундах (от 6 до 3 секунд)
    getShotInterval() {
        const level = this.stats.shootingSpeed;
        // От 6 секунд до 3 секунд
        return 6 - (level * (6 - 3) / 60);
    }
    
    // Получить точность стрельбы (от 0.1 до 0.95)
    getShootingAccuracy(position) {
        const level = this.stats.accuracy;
        const baseAccuracy = 0.1 + (level * (0.95 - 0.1) / 60);
        
        // Модификатор для разных положений
        if (position === 'prone') {
            return Math.min(0.95, baseAccuracy * 1.1); // +10% к точности лёжа
        } else { // standing
            return Math.min(0.85, baseAccuracy * 0.9); // -10% к точности стоя
        }
    }
    
    // Получить максимальную выносливость
    getMaxStamina() {
        const level = this.stats.stamina;
        // От 60 до 150
        return 60 + (level * (150 - 60) / 60);
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
            case 'accuracy':
                return Math.round(this.getShootingAccuracy('prone') * 100) + '%';
            case 'runningSpeed':
                const speedMps = this.getSpeedMps();
                const speedKmh = (speedMps * 3.6).toFixed(1);
                return speedKmh + ' км/ч';
            case 'shootingSpeed':
                const interval = this.getShotInterval();
                return interval.toFixed(1) + 'с';
            case 'stamina':
                return this.getMaxStamina().toFixed(0);
            default:
                return value.toString();
        }
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
                version: '1.0'
            };
            localStorage.setItem('biathlonPlayerProfile', JSON.stringify(saveData));
            console.log("Данные игрока сохранены");
        } catch (error) {
            console.error("Ошибка сохранения данных:", error);
        }
    }
    
    // Загрузить из localStorage
    loadFromStorage() {
        try {
            const savedData = localStorage.getItem('biathlonPlayerProfile');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                if (data.version === '1.0') {
                    this.stats = { ...this.stats, ...data.stats };
                    this.availablePoints = data.availablePoints || this.availablePoints;
                    console.log("Данные игрока загружены:", this.stats);
                }
            }
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        }
    }
    
    // Применить характеристики к игроку в гонке (ОБНОВЛЕНО для новой системы времени)
    applyToGamePlayer(gamePlayer) {
        if (!gamePlayer) return;
        
        // Скорость в м/с (для расчета времени прохождения отрезков)
        gamePlayer.speedMps = this.getSpeedMps();
        
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

        console.log("Характеристики применены к игроку:", {
            speed: gamePlayer.speedMps.toFixed(2) + ' м/с (' + (gamePlayer.speedMps * 3.6).toFixed(1) + ' км/ч)',
            shootingInterval: gamePlayer.shootingInterval.toFixed(1) + 'с',
            accuracyProne: (gamePlayer.shooting.prone * 100).toFixed(1) + '%',
            accuracyStanding: (gamePlayer.shooting.standing * 100).toFixed(1) + '%',
            stamina: gamePlayer.stamina,
            playerLevel: gamePlayer.level
        });
    }
    
    // Получить информацию о рекомендуемых характеристиках для гонки (совместимость с RaceManager)
    getRecommendedStats(raceType) {
        // Базовые рекомендации на основе сложности гонки
        const difficulty = this.calculateRaceDifficulty(raceType);
        
        return {
            runningSpeed: Math.max(5, difficulty * 0.8),
            accuracy: Math.max(70, difficulty * 5),
            shootingSpeed: Math.max(2.0, difficulty * 0.3),
            stamina: Math.max(100, difficulty * 10)
        };
    }
    
    // Вспомогательный метод для расчета сложности гонки
    calculateRaceDifficulty(raceType) {
        // Упрощенный расчет сложности гонки
        const raceInfo = this.getRaceInfo(raceType);
        if (!raceInfo) return 0;
        
        let difficulty = 0;
        difficulty += raceInfo.shootingRounds.length * 2;
        difficulty += raceInfo.totalLaps;
        
        return difficulty;
    }
    
    // Вспомогательный метод для получения информации о гонке
    getRaceInfo(raceType) {
        // Этот метод должен быть совместим с RaceManager
        if (window.biathlonGame && window.biathlonGame.raceTypes) {
            return window.biathlonGame.raceTypes[raceType] || null;
        }
        return null;
    }
    
    // Получить расчетное время прохождения отрезка (150м)
    getSegmentTime() {
        const speedMps = this.getSpeedMps();
        return 150 / speedMps; // Время в секундах для прохождения 150 метров
    }
    
    // Получить расчетное время стрельбы (5 выстрелов)
    getShootingTime() {
        const shotInterval = this.getShotInterval();
        return shotInterval * 5; // Общее время стрельбы
    }
    
    // Получить информацию о прогрессе для отображения
    getProgressInfo() {
        return {
            segmentTime: this.getSegmentTime().toFixed(1) + 'с',
            shootingTime: this.getShootingTime().toFixed(1) + 'с',
            totalLevel: this.getPlayerLevel(),
            speed: (this.getSpeedMps() * 3.6).toFixed(1) + ' км/ч',
            accuracyProne: (this.getShootingAccuracy('prone') * 100).toFixed(1) + '%',
            accuracyStanding: (this.getShootingAccuracy('standing') * 100).toFixed(1) + '%'
        };
    }
}
