class RaceManager {
    constructor() {
        this.availableRaces = {};
        this.currentRace = null;
        this.raceHistory = [];
        
        console.log("RaceManager инициализирован для непрерывной системы");
        
        // Загружаем историю
        this.loadHistoryFromStorage();
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
    
    // Рассчитать сложность гонки для непрерывной системы
    calculateRaceDifficulty(raceType) {
        const race = this.getRaceInfo(raceType);
        if (!race) return 0;
        
        let difficulty = 0;
        
        // Сложность зависит от общей дистанции, количества стрельб и типа штрафов
        difficulty += race.totalDistance / 1000; // Каждый км +1 к сложности
        difficulty += race.shootingRounds.length * 2; // Каждая стрельба +2 к сложности
        difficulty += race.totalLaps * 0.5; // Каждый круг +0.5 к сложности
        
        // Учитываем тип гонки и штрафы
        switch(raceType) {
            case 'SPRINT':
                difficulty *= 0.8;
                break;
            case 'PURSUIT':
                difficulty *= 1.0;
                break;
            case 'MASS':
                difficulty *= 1.2;
                break;
            case 'INDIVIDUAL':
                difficulty *= 1.5; // Индивидуальная сложнее из-за штрафных минут
                break;
        }
        
        // Учитываем тип штрафов
        if (race.penaltyType === 'minutes') {
            difficulty *= 1.3; // Штрафные минуты значительно сложнее
        }
        
        return Math.round(difficulty * 10) / 10; // Округляем до 1 знака
    }
    
    // Получить рекомендуемые характеристики для гонки (ОБНОВЛЕНО для непрерывной системы)
    getRecommendedStats(raceType) {
        const difficulty = this.calculateRaceDifficulty(raceType);
        const race = this.getRaceInfo(raceType);
        
        // Базовые рекомендации на основе сложности и типа гонки
        let baseStats = {
            runningSpeed: Math.max(10, difficulty * 3),
            accuracy: Math.max(15, difficulty * 4),
            shootingSpeed: Math.max(10, difficulty * 2),
            stamina: Math.max(15, difficulty * 3)
        };
        
        // Корректировки в зависимости от типа гонки
        if (race) {
            if (raceType === 'SPRINT') {
                // Спринт: больше скорость, меньше выносливость
                baseStats.runningSpeed = Math.max(20, difficulty * 4);
                baseStats.stamina = Math.max(10, difficulty * 2);
            } else if (raceType === 'INDIVIDUAL') {
                // Индивидуальная: больше точность (из-за штрафных минут)
                baseStats.accuracy = Math.max(25, difficulty * 5);
                baseStats.stamina = Math.max(20, difficulty * 4);
            } else if (raceType === 'MASS') {
                // Масс-старт: сбалансированные, но высокие требования
                baseStats.runningSpeed = Math.max(15, difficulty * 3.5);
                baseStats.stamina = Math.max(20, difficulty * 3.5);
            }
        }
        
        // Ограничиваем максимальные значения
        Object.keys(baseStats).forEach(stat => {
            baseStats[stat] = Math.min(60, Math.round(baseStats[stat]));
        });
        
        console.log(`Рекомендуемые характеристики для ${raceType}:`, baseStats);
        return baseStats;
    }
    
    // Сохранить результат гонки в историю (ОБНОВЛЕНО для непрерывной системы)
    saveRaceResult(raceType, position, time, stats, additionalData = {}) {
        const race = this.getRaceInfo(raceType);
        if (!race) {
            console.error("Неизвестный тип гонки:", raceType);
            return;
        }
        
        const result = {
            // Основная информация
            raceType: raceType,
            raceName: race.name,
            position: position,
            time: time,
            formattedTime: this.formatRaceTime(time),
            date: new Date().toISOString(),
            timestamp: Date.now(),
            
            // Характеристики игрока
            playerStats: stats,
            
            // Информация о гонке
            difficulty: this.calculateRaceDifficulty(raceType),
            totalDistance: race.totalDistance,
            lapDistance: race.lapDistance,
            totalLaps: race.totalLaps,
            shootingRounds: race.shootingRounds.length,
            penaltyType: race.penaltyType,
            
            // Дополнительные данные из гонки
            distanceCovered: additionalData.distanceCovered || 0,
            totalMisses: additionalData.totalMisses || 0,
            penaltyMinutes: additionalData.penaltyMinutes || 0,
            penaltyLoops: additionalData.penaltyLoops || 0,
            avgSpeed: additionalData.avgSpeed || 0,
            maxSpeed: additionalData.maxSpeed || 0,
            
            // Системная информация
            version: '3.0',
            gameMode: 'continuous'
        };
        
        this.raceHistory.unshift(result); // Добавляем в начало
        
        // Сохраняем в localStorage
        this.saveHistoryToStorage();
        
        console.log("Результат гонки сохранен:", {
            race: race.name,
            position: position,
            time: this.formatRaceTime(time),
            distance: `${(result.distanceCovered / 1000).toFixed(2)} км`
        });
        
        // Показываем уведомление о новом рекорде
        this.checkForNewRecord(raceType, position, time);
        
        return result;
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
            
            return true;
        }
        
        return false;
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
    
    // Получить статистику по гонкам (ОБНОВЛЕНО для непрерывной системы)
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
                shootingAccuracy: 0,
                efficiency: 0
            };
        }
        
        const victories = this.raceHistory.filter(r => r.position === 1).length;
        const podiums = this.raceHistory.filter(r => r.position <= 3).length;
        const bestPosition = Math.min(...this.raceHistory.map(r => r.position));
        const totalDistance = this.raceHistory.reduce((sum, race) => sum + (race.distanceCovered || 0), 0);
        const totalTime = this.raceHistory.reduce((sum, race) => sum + race.time, 0);
        const averagePosition = this.raceHistory.reduce((sum, race) => sum + race.position, 0) / this.raceHistory.length;
        
        // Расчет эффективности стрельбы
        let totalShots = 0;
        let totalHits = 0;
        
        this.raceHistory.forEach(race => {
            const shotsInRace = race.shootingRounds * 5;
            const misses = race.totalMisses || 0;
            totalShots += shotsInRace;
            totalHits += shotsInRace - misses;
        });
        
        const shootingAccuracy = totalShots > 0 ? (totalHits / totalShots) * 100 : 0;
        
        // Расчет общей эффективности
        const efficiency = this.calculateOverallEfficiency();
        
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
            efficiency: efficiency,
            winRate: ((victories / this.raceHistory.length) * 100).toFixed(1),
            podiumRate: ((podiums / this.raceHistory.length) * 100).toFixed(1),
            avgTimePerKm: totalDistance > 0 ? (totalTime / (totalDistance / 1000)).toFixed(1) : 0,
            totalShots: totalShots,
            totalHits: totalHits
        };
        
        return stats;
    }
    
    // Расчет общей эффективности игрока
    calculateOverallEfficiency() {
        if (this.raceHistory.length === 0) return 0;
        
        let totalEfficiency = 0;
        let validRaces = 0;
        
        this.raceHistory.forEach(race => {
            // Эффективность = (сложность гонки / позиция) * коэффициент времени
            const difficulty = race.difficulty;
            const position = race.position;
            const expectedTime = this.calculateExpectedTime(race.raceType, race.playerStats);
            
            if (expectedTime > 0) {
                const timeEfficiency = Math.min(1.5, expectedTime / race.time); // Максимум 150%
                const positionEfficiency = 1 / (position * 0.5); // Чем выше позиция, тем лучше
                const raceEfficiency = (timeEfficiency + positionEfficiency) * difficulty;
                
                totalEfficiency += raceEfficiency;
                validRaces++;
            }
        });
        
        return validRaces > 0 ? (totalEfficiency / validRaces * 10).toFixed(1) : 0;
    }
    
    // Расчет ожидаемого времени для гонки на основе характеристик
    calculateExpectedTime(raceType, stats) {
        const race = this.getRaceInfo(raceType);
        if (!race) return 0;
        
        // Базовое время на основе характеристик
        const runningLevel = stats.runningSpeed || 0;
        const shootingLevel = stats.shootingSpeed || 0;
        const accuracyLevel = stats.accuracy || 0;
        
        // Расчетная скорость (м/с)
        const baseSpeed = 4.44 + (runningLevel / 60) * (7.78 - 4.44);
        
        // Время на круги
        const lapTime = race.lapDistance / baseSpeed;
        const totalLapTime = lapTime * race.totalLaps;
        
        // Время на стрельбу
        const shootingInterval = 6 - (shootingLevel / 60) * 3;
        const shootingTime = shootingInterval * 5 * race.shootingRounds.length;
        
        // Штрафное время (оценка)
        const accuracy = 0.5 + (accuracyLevel / 60) * 0.45;
        const expectedMisses = (1 - accuracy) * 5 * race.shootingRounds.length;
        
        let penaltyTime = 0;
        if (race.penaltyType === 'minutes') {
            penaltyTime = expectedMisses * (race.penaltyPerMiss || 60);
        } else {
            const penaltyLoopTime = (race.penaltyLoopDistance || 150) / (baseSpeed * 0.8);
            penaltyTime = expectedMisses * penaltyLoopTime;
        }
        
        return totalLapTime + shootingTime + penaltyTime;
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
        const raceTypes = ['SPRINT', 'PURSUIT', 'MASS', 'INDIVIDUAL'];
        
        raceTypes.forEach(raceType => {
            const raceResults = this.raceHistory.filter(r => r.raceType === raceType);
            if (raceResults.length > 0) {
                const bestTime = Math.min(...raceResults.map(r => r.time));
                const bestPosition = Math.min(...raceResults.map(r => r.position));
                const completed = raceResults.length;
                const victories = raceResults.filter(r => r.position === 1).length;
                
                progress[raceType] = {
                    name: this.getRaceInfo(raceType)?.name || raceType,
                    completed: completed,
                    victories: victories,
                    bestTime: bestTime,
                    bestTimeFormatted: this.formatRaceTime(bestTime),
                    bestPosition: bestPosition,
                    difficulty: this.calculateRaceDifficulty(raceType),
                    winRate: ((victories / completed) * 100).toFixed(1),
                    avgTime: raceResults.reduce((sum, r) => sum + r.time, 0) / completed,
                    totalDistance: raceResults.reduce((sum, r) => sum + (r.distanceCovered || 0), 0)
                };
            } else {
                progress[raceType] = {
                    name: this.getRaceInfo(raceType)?.name || raceType,
                    completed: 0,
                    victories: 0,
                    bestTime: null,
                    bestTimeFormatted: '--:--.-',
                    bestPosition: null,
                    difficulty: this.calculateRaceDifficulty(raceType),
                    winRate: '0.0',
                    avgTime: null,
                    totalDistance: 0
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
        const totalDistance = raceResults.reduce((sum, r) => sum + (r.distanceCovered || 0), 0);
        
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
            difficulty: this.calculateRaceDifficulty(raceType),
            totalDistance: totalDistance,
            totalDistanceKm: (totalDistance / 1000).toFixed(1),
            avgSpeed: totalDistance > 0 ? (totalDistance / raceResults.reduce((sum, r) => sum + r.time, 0)).toFixed(2) : 0
        };
    }
    
    // Сохранить историю в localStorage
    saveHistoryToStorage() {
        try {
            const saveData = {
                raceHistory: this.raceHistory,
                version: '3.0',
                savedAt: new Date().toISOString(),
                statistics: this.getRaceStatistics()
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
                if (data.version === '3.0') {
                    this.raceHistory = data.raceHistory || [];
                    console.log("История гонок загружена (v3.0):", this.raceHistory.length, "записей");
                } else if (data.version === '2.0') {
                    // Конвертация из версии 2.0
                    this.raceHistory = this.migrateFromV2(data.raceHistory);
                    console.log("История гонок мигрирована с v2.0:", this.raceHistory.length, "записей");
                    this.saveHistoryToStorage();
                } else if (data.version === '1.0') {
                    // Конвертация из версии 1.0
                    this.raceHistory = this.migrateFromV1(data.raceHistory);
                    console.log("История гонок мигрирована с v1.0:", this.raceHistory.length, "записей");
                    this.saveHistoryToStorage();
                } else {
                    // Старый формат без версии
                    this.raceHistory = data.raceHistory || data || [];
                    console.log("История гонок загружена (старый формат):", this.raceHistory.length, "записей");
                    this.saveHistoryToStorage();
                }
            }
        } catch (error) {
            console.error("Ошибка загрузки истории гонок:", error);
        }
    }
    
    // Миграция данных из версии 2.0
    migrateFromV2(oldHistory) {
        return oldHistory.map(race => {
            const raceInfo = this.getRaceInfo(race.raceType);
            return {
                ...race,
                // Добавляем новые поля для непрерывной системы
                lapDistance: raceInfo?.lapDistance || 0,
                penaltyType: raceInfo?.penaltyType || 'loops',
                distanceCovered: race.distanceCovered || raceInfo?.totalDistance || 0,
                totalMisses: race.totalMisses || 0,
                penaltyMinutes: race.penaltyMinutes || 0,
                penaltyLoops: race.penaltyLoops || 0,
                version: '3.0',
                gameMode: 'continuous'
            };
        });
    }
    
    // Миграция данных из версии 1.0
    migrateFromV1(oldHistory) {
        return oldHistory.map(race => {
            const raceInfo = this.getRaceInfo(race.raceType);
            return {
                // Сохраняем основные поля
                raceType: race.raceType,
                raceName: race.raceName || raceInfo?.name || race.raceType,
                position: race.position,
                time: race.time,
                formattedTime: race.formattedTime || this.formatRaceTime(race.time),
                date: race.date,
                timestamp: race.timestamp || Date.now(),
                playerStats: race.playerStats,
                
                // Добавляем новые поля
                difficulty: this.calculateRaceDifficulty(race.raceType),
                totalDistance: raceInfo?.totalDistance || 0,
                lapDistance: raceInfo?.lapDistance || 0,
                totalLaps: raceInfo?.totalLaps || 0,
                shootingRounds: raceInfo?.shootingRounds?.length || 0,
                penaltyType: raceInfo?.penaltyType || 'loops',
                distanceCovered: raceInfo?.totalDistance || 0,
                totalMisses: 0,
                penaltyMinutes: 0,
                penaltyLoops: 0,
                version: '3.0',
                gameMode: 'continuous'
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
            version: '3.0',
            exportedAt: new Date().toISOString(),
            statistics: this.getRaceStatistics(),
            progress: this.getRaceTypeProgress()
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
        const progress = this.getRaceTypeProgress();
        
        // Проверяем различные достижения
        if (stats.victories >= 1) achievements.push({ 
            name: "Первая победа", 
            description: "Выиграть первую гонку", 
            unlocked: true,
            icon: "🥇"
        });
        
        if (stats.victories >= 5) achievements.push({ 
            name: "Серия побед", 
            description: "Выиграть 5 гонок", 
            unlocked: true,
            icon: "🔥"
        });
        
        if (stats.victories >= 10) achievements.push({ 
            name: "Ветеран", 
            description: "Выиграть 10 гонок", 
            unlocked: true,
            icon: "🎖️"
        });
        
        if (stats.totalRaces >= 10) achievements.push({ 
            name: "Опытный биатлонист", 
            description: "Завершить 10 гонок", 
            unlocked: true,
            icon: "⛷️"
        });
        
        if (stats.totalRaces >= 25) achievements.push({ 
            name: "Профессионал", 
            description: "Завершить 25 гонок", 
            unlocked: true,
            icon: "🏆"
        });
        
        if (stats.totalRaces >= 50) achievements.push({ 
            name: "Легенда", 
            description: "Завершить 50 гонок", 
            unlocked: true,
            icon: "🌟"
        });
        
        if (stats.bestPosition === 1) achievements.push({ 
            name: "Чемпион", 
            description: "Занять первое место", 
            unlocked: true,
            icon: "👑"
        });
        
        // Достижения по типам гонок
        Object.keys(progress).forEach(raceType => {
            if (progress[raceType].completed > 0) {
                achievements.push({ 
                    name: `Освоение ${progress[raceType].name}`, 
                    description: `Завершить гонку типа ${progress[raceType].name}`, 
                    unlocked: true,
                    icon: "🎯"
                });
            }
            
            if (progress[raceType].victories >= 3) {
                achievements.push({ 
                    name: `Мастер ${progress[raceType].name}`, 
                    description: `Выиграть 3 гонки типа ${progress[raceType].name}`, 
                    unlocked: true,
                    icon: "💎"
                });
            }
        });
        
        // Проверяем завершение всех типов гонок
        const allRacesCompleted = Object.keys(progress).every(raceType => 
            progress[raceType].completed > 0
        );
        
        if (allRacesCompleted) {
            achievements.push({ 
                name: "Универсал", 
                description: "Завершить все типы гонок", 
                unlocked: true,
                icon: "🎪"
            });
        }
        
        // Достижения по эффективности
        if (stats.efficiency >= 80) {
            achievements.push({ 
                name: "Высокая эффективность", 
                description: "Достичь эффективности 80%+", 
                unlocked: true,
                icon: "📊"
            });
        }
        
        if (stats.shootingAccuracy >= 85) {
            achievements.push({ 
                name: "Снайпер", 
                description: "Точность стрельбы 85%+", 
                unlocked: true,
                icon: "🎯"
            });
        }
        
        return achievements;
    }
    
    // Получить сводку для главного меню
    getSummary() {
        const stats = this.getRaceStatistics();
        const recentRaces = this.getRecentRaces(3);
        const achievements = this.getAchievements();
        const progress = this.getRaceTypeProgress();
        
        return {
            stats: stats,
            recentRaces: recentRaces,
            achievementsCount: achievements.length,
            unlockedAchievements: achievements.filter(a => a.unlocked).length,
            favoriteRace: this.getFavoriteRace(),
            progress: progress,
            overallEfficiency: stats.efficiency
        };
    }
    
    // Получить аналитику по улучшениям
    getImprovementAnalytics() {
        const stats = this.getRaceStatistics();
        const progress = this.getRaceTypeProgress();
        
        const analytics = {
            // Общая эффективность
            overallEfficiency: stats.efficiency,
            
            // Сильные стороны
            strengths: [],
            
            // Области для улучшения
            improvements: [],
            
            // Рекомендации
            recommendations: []
        };
        
        // Анализ эффективности стрельбы
        if (stats.shootingAccuracy >= 80) {
            analytics.strengths.push("Отличная точность стрельбы");
        } else if (stats.shootingAccuracy <= 60) {
            analytics.improvements.push("Низкая точность стрельбы");
            analytics.recommendations.push("Увеличьте характеристику 'Меткость'");
        }
        
        // Анализ побед
        if (stats.winRate >= 50) {
            analytics.strengths.push("Высокий процент побед");
        } else if (stats.winRate <= 20) {
            analytics.improvements.push("Низкий процент побед");
            analytics.recommendations.push("Улучшите общие характеристики");
        }
        
        // Анализ по типам гонок
        Object.keys(progress).forEach(raceType => {
            if (progress[raceType].winRate < 30 && progress[raceType].completed >= 3) {
                analytics.improvements.push(`Слабые результаты в ${progress[raceType].name}`);
                
                if (raceType === 'INDIVIDUAL') {
                    analytics.recommendations.push("Для индивидуальных гонок важна точность стрельбы");
                } else if (raceType === 'SPRINT') {
                    analytics.recommendations.push("Для спринта важна скорость бега");
                }
            }
        });
        
        // Общие рекомендации
        if (analytics.recommendations.length === 0) {
            analytics.recommendations.push("Продолжайте в том же духе! Ваши характеристики сбалансированы");
        }
        
        return analytics;
    }
    
    // Получить историю прогресса по времени
    getProgressTimeline() {
        if (this.raceHistory.length === 0) return [];
        
        // Группируем по неделям
        const weeklyProgress = {};
        
        this.raceHistory.forEach(race => {
            const raceDate = new Date(race.date);
            const weekKey = `${raceDate.getFullYear()}-W${Math.floor(raceDate.getDate() / 7)}`;
            
            if (!weeklyProgress[weekKey]) {
                weeklyProgress[weekKey] = {
                    week: weekKey,
                    races: 0,
                    victories: 0,
                    totalTime: 0,
                    avgPosition: 0,
                    efficiency: 0
                };
            }
            
            weeklyProgress[weekKey].races++;
            weeklyProgress[weekKey].victories += race.position === 1 ? 1 : 0;
            weeklyProgress[weekKey].totalTime += race.time;
            weeklyProgress[weekKey].avgPosition += race.position;
        });
        
        // Рассчитываем средние значения
        Object.keys(weeklyProgress).forEach(week => {
            const weekData = weeklyProgress[week];
            weekData.avgTime = weekData.totalTime / weekData.races;
            weekData.avgPosition = weekData.avgPosition / weekData.races;
            weekData.winRate = (weekData.victories / weekData.races) * 100;
        });
        
        return Object.values(weeklyProgress).sort((a, b) => a.week.localeCompare(b.week));
    }
}
