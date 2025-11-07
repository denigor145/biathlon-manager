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
    
    // Рассчитать сложность гонки
    calculateRaceDifficulty(raceType) {
        const race = this.getRaceInfo(raceType);
        if (!race) return 0;
        
        let difficulty = 0;
        
        // Сложность зависит от дистанции и количества стрельб
        difficulty += race.shootingRounds.length * 2; // Каждая стрельба +2 к сложности
        difficulty += race.totalLaps; // Каждый круг +1 к сложности
        
        return difficulty;
    }
    
    // Получить рекомендуемые характеристики для гонки
    getRecommendedStats(raceType) {
        const difficulty = this.calculateRaceDifficulty(raceType);
        
        return {
            runningSpeed: Math.max(5, difficulty * 0.8),
            accuracy: Math.max(70, difficulty * 5),
            shootingSpeed: Math.max(2.0, difficulty * 0.3),
            stamina: Math.max(100, difficulty * 10)
        };
    }
    
    // Сохранить результат гонки в историю
    saveRaceResult(raceType, position, time, stats) {
        const result = {
            raceType: raceType,
            position: position,
            time: time,
            date: new Date().toISOString(),
            playerStats: stats,
            difficulty: this.calculateRaceDifficulty(raceType)
        };
        
        this.raceHistory.unshift(result); // Добавляем в начало
        
        // Сохраняем в localStorage
        this.saveHistoryToStorage();
        
        console.log("Результат гонки сохранен:", result);
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
            return current.position < best.position ? current : best;
        });
    }
    
    // Получить статистику по гонкам
    getRaceStatistics() {
        const stats = {
            totalRaces: this.raceHistory.length,
            victories: this.raceHistory.filter(r => r.position === 1).length,
            podiums: this.raceHistory.filter(r => r.position <= 3).length,
            bestPosition: this.raceHistory.length > 0 ? 
                Math.min(...this.raceHistory.map(r => r.position)) : 0,
            favoriteRace: this.getFavoriteRace()
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
    
    // Сохранить историю в localStorage
    saveHistoryToStorage() {
        try {
            const saveData = {
                raceHistory: this.raceHistory,
                version: '1.0'
            };
            localStorage.setItem('biathlonRaceHistory', JSON.stringify(saveData));
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
                if (data.version === '1.0') {
                    this.raceHistory = data.raceHistory || [];
                    console.log("История гонок загружена:", this.raceHistory.length, "записей");
                }
            }
        } catch (error) {
            console.error("Ошибка загрузки истории гонок:", error);
        }
    }
    
    // Очистить историю
    clearHistory() {
        this.raceHistory = [];
        localStorage.removeItem('biathlonRaceHistory');
        console.log("История гонок очищена");
    }
}
