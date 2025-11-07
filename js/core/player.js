class PlayerProfile {
    constructor() {
        // Базовые характеристики игрока - начинаем с 0
        this.stats = {
            runningSpeed: 0,
            accuracy: 0,  
            shootingSpeed: 0,
            stamina: 0
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
    
    // Получить реальную скорость стрельбы в секундах (от 10 до 3 секунд)
    getActualShootingSpeed() {
        const level = this.stats.shootingSpeed;
        // Формула: от 10 секунд при уровне 0 до 3 секунд при уровне 100
        // Без экипировки максимум 60 уровней = 5.8 секунд
        const baseTime = 10 - (level * 7 / 100);
        return Math.max(3, Math.min(10, baseTime));
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
                return value + '%';
            case 'runningSpeed':
            case 'shootingSpeed':
            case 'stamina':
                return value + '/60';
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
        
        // Беговая скорость: от 3 при уровне 0 до 8 при уровне 100
        gamePlayer.speed = 3 + (this.stats.runningSpeed * 5 / 100);
        
        // Выносливость: от 60 при уровне 0 до 150 при уровне 100
        gamePlayer.maxStamina = 60 + (this.stats.stamina * 90 / 100);
        gamePlayer.stamina = gamePlayer.maxStamina;
        
        // Меткость: от 10% при уровне 0 до 80% при уровне 100
        const accuracyPercent = 10 + (this.stats.accuracy * 70 / 100);
        const accuracyDecimal = accuracyPercent / 100;
        
        gamePlayer.shooting = {
            prone: Math.min(0.95, accuracyDecimal * 1.1),
            standing: Math.min(0.85, accuracyDecimal * 0.9)
        };
        
        // Скорость стрельбы
        gamePlayer.shootingSpeed = this.getActualShootingSpeed();
        gamePlayer.level = this.stats.shootingSpeed; // Уровень для отображения

        console.log("Характеристики применены к игроку. Уровень скорости стрельбы:", this.stats.shootingSpeed);
    }
}
