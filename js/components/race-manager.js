class RaceManager {
    constructor() {
        this.availableRaces = {};
        this.currentRace = null;
        this.raceHistory = [];
        
        console.log("RaceManager инициализирован");
    }
    
    // Инициализация доступных гонок
    initializeRaces(raceTypes) {
        this.availableRaces = raceTypes;
        console.log("Доступные гонки загружены:", Object.keys(this.availableRaces));
    }
    
    // Получить информацию о гонке
    getRaceInfo(raceType) {
        return this.availableRaces[raceType] || null;
    }
    
    // Получить все доступные гонки
    getAllRaces() {
        return this.availableRaces;
    }
    
    // Рассчитать сложность гонки (ОБНОВЛЕНО для новой системы)
    calculateRaceDifficulty(raceType) {
        const race = this.getRaceInfo(raceType);
        if (!race) return 0;
        
        let difficulty = 0;
        
        // Сложность зависит от дистанции, количества стрельб и кругов
        difficulty += race.totalDistance / 1000; // Каждый км +1 к сложности
        difficulty += race.shootingRounds.length * 3; // Каждая стрельба +3 к сложности
        difficulty += race.totalLaps; // Каждый круг +1 к сложности
        
        // Учитываем тип гонки
        switch(raceType) {
            case 'sprint':
                difficulty *= 0.8;
                break;
            case 'pursuit':
                difficulty *= 1.0;
                break;
            case 'mass':
                difficulty *= 1.2;
                break;
            case 'individual':
                difficulty *= 1.5;
                break;
        }
        
        return Math.round(difficulty);
    }
    
    // Получить рекомендуемые характеристики для гонки (ОБНОВЛЕНО)
    getRecommendedStats(raceType) {
        const difficulty = this.calculateRaceDifficulty(raceType);
        const race = this.getRaceInfo(raceType);
        
        // Базовые рекомендации на основе сложности и типа гонки
        let baseStats = {
            runningSpeed: Math.max(10, difficulty * 1.5),
            accuracy: Math.max(20, difficulty * 2),
            shootingSpeed: Math.max(10, difficulty * 1.2),
            stamina: Math.max(20, difficulty * 2)
        };
        
        // Корректировки в зависимости от типа гонки
        if (race) {
            if (raceType === 'sprint') {
                // Спринт: больше скорость, меньше выносливость
                baseStats.runningSpeed = Math.max(15, difficulty * 2);
                baseStats.stamina = Math.max(15, difficulty * 1.5);
            } else if (raceType === 'individual') {
                // Индивидуальная: больше точность, меньше скорость стрельбы
                baseStats.accuracy = Math.max(25, difficulty * 2.5);
                baseStats.stamina = Math.max(25, difficulty * 2.5);
            } else if (raceType === 'mass') {
                // Масс-старт: сбалансированные характеристики
                baseStats.runningSpeed = Math.max(12, difficulty * 1.8);
                baseStats.stamina = Math.max(22, difficulty * 2.2);
            }
        }
        
        // Ограничиваем максимальные значения
        Object.keys(baseStats).forEach(stat => {
            baseStats[stat] = Math.min(60, baseStats[stat]);
        });
        
        console.log(`Рекомендуемые характеристики для ${raceType}:`, baseStats);
        return baseStats;
    }
    
    // Сохранить результат гонки в историю (ОБНОВЛЕНО для новой системы времени)
    saveRaceResult(raceType, position, time, stats) {
        const race = this.getRaceInfo(raceType);
        if (!race) {
            console.error("Неизвестный тип гонки:", raceType);
            return;
        }
        
        const result = {
            raceType: raceType,
            raceName: race.name,
            position: position,
            time: time,
            formattedTime: this.formatRaceTime(time),
            date: new Date().toISOString(),
            playerStats: stats,
            difficulty: this.calculateRaceDifficulty(raceType),
            distance: race.totalDistance,
            laps: race.totalLaps,
            shootings: race.shootingRounds.length
        };
        
        this.raceHistory.unshift(result); // Добавляем в начало
        
        // Сохраняем в localStorage
        this.saveHistoryToStorage();
        
        console.log("Результат гонки сохранен:", result);
        
        // Показываем уведомление о новом рекорде
        this.checkForNewRecord(raceType, position, time);
    }
    
    // Форматирование времени гонки
    formatRaceTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
    }
    
    // Проверка на новый рекорд
    checkForNewRecord(raceType, position, time) {
        const bestResult = this.getBestResult(raceType);
        
        if (!bestResult || time < bestResult.time) {
            let message = "🎉 Новый рекорд! ";
            
            if (position === 1) {
                message += `Победа в ${this.getRaceInfo(raceType).name} за ${this.formatRaceTime(time)}`;
            } else {
                message += `Лучшее время в ${this.getRaceInfo(raceType).name}: ${this.formatRaceTime(time)}`;
            }
            
            console.log(message);
            
            if (window.gameScreen) {
                window.gameScreen.showMessage(message, "success");
            }
        }
    }
    
    // Получить историю гонок
    getRaceHistory() {
        return this.raceHistory;
    }
    
    // Получить лучший результат для гонки
    getBestResult(raceType) {
        const raceResults = this.raceHistory.filter(result => result.raceType === raceType);
        if (raceResults.length === 0) return null;
        
        return raceResults.reduce((best, current) => {
            return current.time < best.time ? current : best;
        });
    }
    
    // Получить статистику по гонкам (ОБНОВЛЕНО)
    getRaceStatistics() {
        if (this.raceHistory.length === 0) {
            return {
                totalRaces: 0,
                victories: 0,
                podiums: 0,
                bestPosition: 0,
                favoriteRace: null,
                totalDistance: 0,
                totalTime: 0,
                averagePosition: 0,
                shootingAccuracy: 0
            };
        }
        
        const victories = this.raceHistory.filter(r => r.position === 1).length;
        const podiums = this.raceHistory.filter(r => r.position <= 3).length;
        const bestPosition = Math.min(...this.raceHistory.map(r => r.position));
        const totalDistance = this.raceHistory.reduce((sum, race) => sum + race.distance, 0);
        const totalTime = this.raceHistory.reduce((sum, race) => sum + race.time, 0);
        const averagePosition = this.raceHistory.reduce((sum, race) => sum + race.position, 0) / this.raceHistory.length;
        
        // Расчет примерной точности стрельбы на основе характеристик
        let totalAccuracy = 0;
        let accuracyCount = 0;
        this.raceHistory.forEach(race => {
            if (race.playerStats && race.playerStats.accuracy) {
                // Преобразуем уровень точности в процент (0-60 -> 10%-95%)
                const accuracyLevel = race.playerStats.accuracy;
                const accuracyPercent = 10 + (accuracyLevel * (95 - 10) / 60);
                totalAccuracy += accuracyPercent;
                accuracyCount++;
            }
        });
        
        const shootingAccuracy = accuracyCount > 0 ? totalAccuracy / accuracyCount : 0;
        
        const stats = {
            totalRaces: this.raceHistory.length,
            victories: victories,
            podiums: podiums,
            bestPosition: bestPosition,
            favoriteRace: this.getFavoriteRace(),
            totalDistance: totalDistance,
            totalDistanceKm: (totalDistance / 1000).toFixed(1),
            totalTime: totalTime,
            totalTimeFormatted: this.formatRaceTime(totalTime),
            averagePosition: averagePosition.toFixed(1),
            shootingAccuracy: shootingAccuracy.toFixed(1),
            winRate: ((victories / this.raceHistory.length) * 100).toFixed(1),
            podiumRate: ((podiums / this.raceHistory.length) * 100).toFixed(1)
        };
        
        return stats;
    }
    
    // Получить самую частую гонку
    getFavoriteRace() {
        if (this.raceHistory.length === 0) return null;
        
        const raceCounts = {};
        this.raceHistory.forEach(race => {
            raceCounts[race.raceType] = (raceCounts[race.raceType] || 0) + 1;
        });
        
        return Object.keys(raceCounts).reduce((a, b) => 
            raceCounts[a] > raceCounts[b] ? a : b
        );
    }
    
    // Получить прогресс игрока по типам гонок
    getRaceTypeProgress() {
        const progress = {};
        const raceTypes = ['sprint', 'pursuit', 'mass', 'individual'];
        
        raceTypes.forEach(raceType => {
            const raceResults = this.raceHistory.filter(r => r.raceType === raceType);
            if (raceResults.length > 0) {
                const bestTime = Math.min(...raceResults.map(r => r.time));
                const bestPosition = Math.min(...raceResults.map(r => r.position));
                const completed = raceResults.length;
                
                progress[raceType] = {
                    name: this.getRaceInfo(raceType)?.name || raceType,
                    completed: completed,
                    bestTime: bestTime,
                    bestTimeFormatted: this.formatRaceTime(bestTime),
                    bestPosition: bestPosition,
                    difficulty: this.calculateRaceDifficulty(raceType)
                };
            } else {
                progress[raceType] = {
                    name: this.getRaceInfo(raceType)?.name || raceType,
                    completed: 0,
                    bestTime: null,
                    bestTimeFormatted: '--:--.-',
                    bestPosition: null,
                    difficulty: this.calculateRaceDifficulty(raceType)
                };
            }
        });
        
        return progress;
    }
    
    // Получить последние гонки
    getRecentRaces(limit = 5) {
        return this.raceHistory.slice(0, limit);
    }
    
    // Получить детальную статистику по конкретной гонке
    getRaceTypeStats(raceType) {
        const raceResults = this.raceHistory.filter(r => r.raceType === raceType);
        if (raceResults.length === 0) return null;
        
        const bestTime = Math.min(...raceResults.map(r => r.time));
        const bestPosition = Math.min(...raceResults.map(r => r.position));
        const averageTime = raceResults.reduce((sum, r) => sum + r.time, 0) / raceResults.length;
        const victories = raceResults.filter(r => r.position === 1).length;
        
        return {
            raceType: raceType,
            raceName: this.getRaceInfo(raceType)?.name || raceType,
            completed: raceResults.length,
            bestTime: bestTime,
            bestTimeFormatted: this.formatRaceTime(bestTime),
            bestPosition: bestPosition,
            averageTime: averageTime,
            averageTimeFormatted: this.formatRaceTime(averageTime),
            victories: victories,
            winRate: ((victories / raceResults.length) * 100).toFixed(1),
            difficulty: this.calculateRaceDifficulty(raceType)
        };
    }
    
    // Сохранить историю в localStorage
    saveHistoryToStorage() {
        try {
            const saveData = {
                raceHistory: this.raceHistory,
                version: '2.0', // Обновляем версию для новой системы
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('biathlonRaceHistory', JSON.stringify(saveData));
            console.log("История гонок сохранена, записей:", this.raceHistory.length);
        } catch (error) {
            console.error("Ошибка сохранения истории гонок:", error);
        }
    }
    
    // Загрузить историю из localStorage
    loadHistoryFromStorage() {
        try {
            const savedData = localStorage.getItem('biathlonRaceHistory');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // Поддержка разных версий
                if (data.version === '2.0') {
                    this.raceHistory = data.raceHistory || [];
                    console.log("История гонок загружена (v2.0):", this.raceHistory.length, "записей");
                } else if (data.version === '1.0') {
                    // Конвертация из старой версии
                    this.raceHistory = this.migrateFromV1(data.raceHistory);
                    console.log("История гонок мигрирована с v1.0:", this.raceHistory.length, "записей");
                    this.saveHistoryToStorage(); // Сохраняем в новом формате
                } else {
                    // Старый формат без версии
                    this.raceHistory = data.raceHistory || data || [];
                    console.log("История гонок загружена (старый формат):", this.raceHistory.length, "записей");
                    this.saveHistoryToStorage(); // Сохраняем в новом формате
                }
            }
        } catch (error) {
            console.error("Ошибка загрузки истории гонок:", error);
        }
    }
    
    // Миграция данных из версии 1.0
    migrateFromV1(oldHistory) {
        return oldHistory.map(race => {
            // Добавляем недостающие поля для новой системы
            const raceInfo = this.getRaceInfo(race.raceType);
            return {
                ...race,
                raceName: raceInfo?.name || race.raceType,
                formattedTime: this.formatRaceTime(race.time),
                distance: raceInfo?.totalDistance || 0,
                laps: raceInfo?.totalLaps || 0,
                shootings: raceInfo?.shootingRounds?.length || 0
            };
        });
    }
    
    // Очистить историю
    clearHistory() {
        this.raceHistory = [];
        localStorage.removeItem('biathlonRaceHistory');
        console.log("История гонок очищена");
    }
    
    // Экспорт истории в JSON
    exportHistory() {
        const exportData = {
            raceHistory: this.raceHistory,
            version: '2.0',
            exportedAt: new Date().toISOString(),
            statistics: this.getRaceStatistics()
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    // Импорт истории из JSON
    importHistory(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            if (importData.raceHistory && Array.isArray(importData.raceHistory)) {
                this.raceHistory = importData.raceHistory;
                this.saveHistoryToStorage();
                console.log("История гонок импортирована:", this.raceHistory.length, "записей");
                return true;
            }
        } catch (error) {
            console.error("Ошибка импорта истории гонок:", error);
        }
        
        return false;
    }
    
    // Получить достижения игрока
    getAchievements() {
        const achievements = [];
        const stats = this.getRaceStatistics();
        
        // Проверяем различные достижения
        if (stats.victories >= 1) achievements.push({ name: "Первая победа", description: "Выиграть первую гонку", unlocked: true });
        if (stats.victories >= 5) achievements.push({ name: "Серия побед", description: "Выиграть 5 гонок", unlocked: true });
        if (stats.victories >= 10) achievements.push({ name: "Ветеран", description: "Выиграть 10 гонок", unlocked: true });
        
        if (stats.totalRaces >= 10) achievements.push({ name: "Опытный биатлонист", description: "Завершить 10 гонок", unlocked: true });
        if (stats.totalRaces >= 25) achievements.push({ name: "Профессионал", description: "Завершить 25 гонок", unlocked: true });
        if (stats.totalRaces >= 50) achievements.push({ name: "Легенда", description: "Завершить 50 гонок", unlocked: true });
        
        if (stats.bestPosition === 1) achievements.push({ name: "Чемпион", description: "Занять первое место", unlocked: true });
        
        const progress = this.getRaceTypeProgress();
        let allRacesCompleted = true;
        Object.keys(progress).forEach(raceType => {
            if (progress[raceType].completed > 0) {
                achievements.push({ 
                    name: `Освоение ${progress[raceType].name}`, 
                    description: `Завершить гонку типа ${progress[raceType].name}`, 
                    unlocked: true 
                });
            } else {
                allRacesCompleted = false;
            }
        });
        
        if (allRacesCompleted) {
            achievements.push({ name: "Универсал", description: "Завершить все типы гонок", unlocked: true });
        }
        
        return achievements;
    }
    
    // Получить сводку для главного меню
    getSummary() {
        const stats = this.getRaceStatistics();
        const recentRaces = this.getRecentRaces(3);
        const achievements = this.getAchievements();
        
        return {
            stats: stats,
            recentRaces: recentRaces,
            achievementsCount: achievements.length,
            favoriteRace: this.getFavoriteRace(),
            progress: this.getRaceTypeProgress()
        };
    }
}
