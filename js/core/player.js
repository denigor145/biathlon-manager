class PlayerProfile {
    constructor() {
        // Базовые характеристики игрока
        this.stats = {
            runningSpeed: 5,      // Базовая скорость бега
            accuracy: 70,         // Меткость в процентах
            shootingSpeed: 2.0,   // Скорость стрельбы (модификатор)
            stamina: 100          // Выносливость
        };
        
        // Очки для распределения
        this.availablePoints = 10;
        
        // Минимальные и максимальные значения характеристик
        this.minValues = {
            runningSpeed: 3,
            accuracy: 50,
            shootingSpeed: 1.0,
            stamina: 60
        };
        
        this.maxValues = {
            runningSpeed: 8,
            accuracy: 95,
            shootingSpeed: 3.5,
            stamina: 150
        };
        
        // Стоимость улучшения (сколько очков стоит увеличение на 1)
        this.upgradeCosts = {
            runningSpeed: 1,
            accuracy: 2,          // Меткость дороже, так как сильно влияет на игру
            shootingSpeed: 1,
            stamina: 1
        };
        
        // Загружаем сохраненные данные
        this.loadFromStorage();
        
        console.log("PlayerProfile инициализирован:", this.stats);
    }
    
    // Увеличить характеристику
    increaseStat(statName) {
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
        
        // Увеличиваем характеристику
        let newValue;
        switch(statName) {
            case 'runningSpeed':
                newValue = currentValue + 0.5;
                break;
            case 'shootingSpeed':
                newValue = currentValue + 0.1;
                break;
            case 'accuracy':
                newValue = currentValue + 5;
                break;
            case 'stamina':
                newValue = currentValue + 10;
                break;
            default:
                newValue = currentValue + 1;
        }
        
        // Ограничиваем максимальным значением
        newValue = Math.min(newValue, maxValue);
        
        // Округляем для красивых значений
        if (statName === 'runningSpeed' || statName === 'shootingSpeed') {
            newValue = Math.round(newValue * 10) / 10;
        } else {
            newValue = Math.round(newValue);
        }
        
        // Применяем изменения
        this.stats[statName] = newValue;
        this.availablePoints -= cost;
        
        console.log(`Улучшена ${statName}: ${currentValue} → ${newValue}, осталось очков: ${this.availablePoints}`);
        
        // Сохраняем и обновляем UI
        this.saveToStorage();
        this.updateUI();
        
        return true;
    }
    
    // Уменьшить характеристику
    decreaseStat(statName) {
        const currentValue = this.stats[statName];
        const minValue = this.minValues[statName];
        
        if (currentValue <= minValue) {
            console.log(`Характеристика ${statName} уже минимальная`);
            return false;
        }
        
        const cost = this.upgradeCosts[statName];
        
        // Уменьшаем характеристику
        let newValue;
        switch(statName) {
            case 'runningSpeed':
                newValue = currentValue - 0.5;
                break;
            case 'shootingSpeed':
                newValue = currentValue - 0.1;
                break;
            case 'accuracy':
                newValue = currentValue - 5;
                break;
            case 'stamina':
                newValue = currentValue - 10;
                break;
            default:
                newValue = currentValue - 1;
        }
        
        // Ограничиваем минимальным значением
        newValue = Math.max(newValue, minValue);
        
        // Округляем для красивых значений
        if (statName === 'runningSpeed' || statName === 'shootingSpeed') {
            newValue = Math.round(newValue * 10) / 10;
        } else {
            newValue = Math.round(newValue);
        }
        
        // Возвращаем очки
        this.stats[statName] = newValue;
        this.availablePoints += cost;
        
        console.log(`Уменьшена ${statName}: ${currentValue} → ${newValue}, доступно очков: ${this.availablePoints}`);
        
        // Сохраняем и обновляем UI
        this.saveToStorage();
        this.updateUI();
        
        return true;
    }
    
    // Сбросить все характеристики
    resetStats() {
        const defaultStats = {
            runningSpeed: 5,
            accuracy: 70,
            shootingSpeed: 2.0,
            stamina: 100
        };
        
        // Возвращаем все потраченные очки
        let spentPoints = 0;
        for (const stat in this.stats) {
            const diff = this.stats[stat] - defaultStats[stat];
            if (diff > 0) {
                // Рассчитываем возврат очков (упрощенно)
                spentPoints += Math.abs(diff) * this.upgradeCosts[stat];
            }
        }
        
        this.stats = { ...defaultStats };
        this.availablePoints = 10; // Возвращаем базовые очки
        
        console.log("Характеристики сброшены, доступно очков:", this.availablePoints);
        
        this.saveToStorage();
        this.updateUI();
        
        return true;
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
                return value.toFixed(1);
            case 'stamina':
                return value.toString();
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
        if (typeof window.characterScreen !== 'undefined') {
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
        
        // Применяем характеристики к игровому объекту
        gamePlayer.speed = this.stats.runningSpeed;
        gamePlayer.maxStamina = this.stats.stamina;
        gamePlayer.stamina = this.stats.stamina; // Полное восстановление
        
        // Меткость для разных положений стрельбы
        const accuracyDecimal = this.stats.accuracy / 100;
        gamePlayer.shooting = {
            prone: Math.min(0.95, accuracyDecimal * 1.1),   // Лежа точнее
            standing: Math.min(0.85, accuracyDecimal * 0.9) // Стоя сложнее
        };
        
        // Скорость стрельбы
        gamePlayer.shootingSpeed = this.stats.shootingSpeed;
        
        console.log("Характеристики применены к игроку:", gamePlayer);
    }
    
    // Получить описание характеристик
    getStatDescription(statName) {
        const descriptions = {
            runningSpeed: "Базовая скорость передвижения по трассе. Влияет на время прохождения кругов.",
            accuracy: "Вероятность попадания в мишень. Более высокая меткость уменьшает количество промахов.",
            shootingSpeed: "Скорость выполнения выстрелов. Быстрая стрельба позволяет раньше продолжить гонку.",
            stamina: "Максимальный запас выносливости. Влияет на возможность использовать спринт и восстановление."
        };
        
        return descriptions[statName] || "Описание характеристики";
    }
    
    // Получить текущий прогресс характеристики (для визуализации)
    getStatProgress(statName) {
        const current = this.stats[statName];
        const min = this.minValues[statName];
        const max = this.maxValues[statName];
        
        return (current - min) / (max - min);
    }
}
