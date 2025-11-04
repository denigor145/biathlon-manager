class GameUI {
    constructor(game) {
        this.game = game;
    }
    
    updateDisplay() {
        const race = this.game.getCurrentRace();
        
        // Обновляем верхнюю панель
        document.getElementById('currentSegment').textContent = this.game.currentSegment;
        document.getElementById('totalSegments').textContent = race.totalSegments;
        document.getElementById('raceTime').textContent = this.formatTime(this.game.totalTime);
        
        // Обновляем индикаторы
        document.getElementById('pulseValue').textContent = Math.round(this.game.player.pulse);
        document.getElementById('staminaValue').textContent = Math.round(this.game.player.stamina) + '%';
        
        document.getElementById('pulseFill').style.width = ((this.game.player.pulse - 60) / 120 * 100) + '%';
        document.getElementById('staminaFill').style.width = this.game.player.stamina + '%';
        
        // Обновляем таблицу лидеров
        this.updateLeaderboard();
    }
    
    updateLeaderboard() {
        const leader = this.game.allCompetitors[0];
        
        // Обновляем плакат лидера
        document.getElementById('leaderPoster').innerHTML = `
            <div class="leader-flag">${leader.flag}</div>
            <div class="leader-name">${leader.name}</div>
            <div class="leader-time">${this.formatTime(leader.time)}</div>
            <div class="leader-stats">
                <div class="stat">Скорость: ${leader.speed.toFixed(1)}</div>
                <div class="stat">Выносливость: ${Math.round(leader.stamina)}%</div>
            </div>
        `;
        
        // Обновляем список (показываем первые 8)
        const visibleCompetitors = this.game.allCompetitors.slice(0, 8);
        const competitorsList = document.getElementById('competitorsList');
        
        competitorsList.innerHTML = visibleCompetitors.map(competitor => {
            const gap = competitor.time - leader.time;
            
            return `
                <div class="competitor-row ${competitor.isPlayer ? 'player' : ''}">
                    <div class="competitor-position">${competitor.position}</div>
                    <div class="competitor-flag">${competitor.flag}</div>
                    <div class="competitor-name">${competitor.name}</div>
                    <div class="competitor-time">${this.formatTime(competitor.time)}</div>
                    <div class="competitor-gap">+${this.formatTime(gap)}</div>
                </div>
            `;
        }).join('');
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
    }
    
    setupEventListeners() {
        document.getElementById('sprintBtn').addEventListener('click', () => {
            this.game.activateSprint();
            this.updateDisplay();
        });
        
        document.getElementById('slowBtn').addEventListener('click', () => {
            this.game.activateSlowPace();
            this.updateDisplay();
        });
        
        document.getElementById('menuBtn').addEventListener('click', () => {
            const race = this.game.getCurrentRace();
            alert(`Текущая гонка: ${race.name}\nСегмент: ${this.game.currentSegment}/${race.totalSegments}`);
        });
    }
}
