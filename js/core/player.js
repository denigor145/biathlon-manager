class PlayerProfile {
    constructor() {
        // Базовые характеристики игрока - начинаем с 0
        this.stats = {
            runningSpeed: 0,    // Влияет на скорость в м/с
            accuracy: 0,        // Влияет на точность стрельбы
            shootingSpeed: 0,   // Влияет на время между выстрелами
            stamina: 0          // Влияет на максимальную выносливость
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
    
    // Применить характеристики к игроку в гонке
    applyToGamePlayer(gamePlayer) {
        if (!gamePlayer) return;
        
        // Скорость в м/с
        gamePlayer.speedMps = this.getSpeedMps();
        
        // Выносливость
        gamePlayer.maxStamina = this.getMaxStamina();
        gamePlayer.stamina = gamePlayer.maxStamina;
        
        // Меткость для разных положений
        gamePlayer.shooting = {
            prone: this.getShootingAccuracy('prone'),
            standing: this.getShootingAccuracy('standing')
        };
        
        // Скорость стрельбы
        gamePlayer.shootingSpeed = this.getShotInterval();
        
        // Уровень для отображения
        gamePlayer.level = Math.max(
            this.stats.runningSpeed,
            this.stats.accuracy, 
            this.stats.shootingSpeed,
            this.stats.stamina
        );

        console.log("Характеристики применены к игроку:", {
            speed: gamePlayer.speedMps + ' м/с',
            shootingSpeed: gamePlayer.shootingSpeed + 'с',
            accuracyProne: (gamePlayer.shooting.prone * 100).toFixed(1) + '%',
            accuracyStanding: (gamePlayer.shooting.standing * 100).toFixed(1) + '%',
            stamina: gamePlayer.stamina
        });
    }
}
