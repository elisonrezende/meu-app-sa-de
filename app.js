// Estado Inicial
let state = JSON.parse(localStorage.getItem('protocolo31')) || {
    initial: { weight: '', waist: '', pressure: '' },
    daily: {},
    walks: [],
    weeklyBP: { w1: '', w2: '', w3: '', w4: '' },
    final: { weight: '', waist: '', pressure: '' }
};

let currentTab = 'dashboard';
let selectedDay = 1;

function save() {
    localStorage.setItem('protocolo31', JSON.stringify(state));
    render();
}

function showTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(`nav-${tab}`).classList.add('active');
    render();
}

function render() {
    const content = document.getElementById('app-content');
    
    if (currentTab === 'dashboard') {
        const daysCount = Object.keys(state.daily).length;
        const progress = Math.round((daysCount / 31) * 100);
        
        content.innerHTML = `
            <div class="card">
                <h2 style="color: var(--primary); margin-bottom: 10px;">Progresso</h2>
                <div class="progress-bar"><div class="progress-fill" style="width: ${progress}%"></div></div>
                <p style="font-size: 0.8rem; margin-top: 8px; color: var(--text-muted)">${progress}% concluído (${daysCount} de 31 dias)</p>
            </div>
            <div class="grid-stats">
                <div class="stat-item"><p class="stat-label">Caminhadas</p><p class="stat-value">${state.walks.length}</p></div>
                <div class="stat-item"><p class="stat-label">Dias Ativos</p><p class="stat-value">${Object.values(state.daily).filter(d => d.activity).length}</p></div>
            </div>
            <button class="btn-primary" onclick="showTab('daily')" style="margin-top: 20px;">Registrar Dia de Hoje</button>
        `;
    } 
    
    else if (currentTab === 'initial') {
        content.innerHTML = `
            <div class="card">
                <h2>Dados Iniciais</h2>
                <div class="input-group">
                    <label>Peso Inicial (kg)</label>
                    <input type="number" value="${state.initial.weight}" onchange="state.initial.weight=this.value;save()">
                </div>
                <div class="input-group">
                    <label>Circunferência Abdominal (cm)</label>
                    <input type="number" value="${state.initial.waist}" onchange="state.initial.waist=this.value;save()">
                </div>
                <div class="input-group">
                    <label>Pressão Inicial</label>
                    <input type="text" value="${state.initial.pressure}" onchange="state.initial.pressure=this.value;save()">
                </div>
            </div>
        `;
    }

    else if (currentTab === 'daily') {
        const dayData = state.daily[selectedDay] || { creatine: false, omega3: false, magnesium: false, nac: false, maca: false, activity: false, energy: 5, sleep: 5 };
        
        let daysHtml = '';
        for(let i=1; i<=31; i++) {
            daysHtml += `<div class="day-btn ${selectedDay == i ? 'active' : ''}" onclick="selectedDay=${i};render()">${i}</div>`;
        }

        content.innerHTML = `
            <div class="day-selector">${daysHtml}</div>
            <h2>Dia ${selectedDay}</h2>
            <div class="check-item" onclick="toggleDaily('creatine')"><input type="checkbox" ${dayData.creatine ? 'checked' : ''}> Creatina</div>
            <div class="check-item" onclick="toggleDaily('omega3')"><input type="checkbox" ${dayData.omega3 ? 'checked' : ''}> Ômega 3</div>
            <div class="check-item" onclick="toggleDaily('magnesium')"><input type="checkbox" ${dayData.magnesium ? 'checked' : ''}> Magnésio</div>
            <div class="check-item" onclick="toggleDaily('nac')"><input type="checkbox" ${dayData.nac ? 'checked' : ''}> NAC</div>
            <div class="check-item" onclick="toggleDaily('maca')"><input type="checkbox" ${dayData.maca ? 'checked' : ''}> Maca</div>
            <div class="check-item" onclick="toggleDaily('activity')"><input type="checkbox" ${dayData.activity ? 'checked' : ''}> Atividade Física</div>
            
            <div class="input-group" style="margin-top: 20px;">
                <label>Energia (0-10): ${dayData.energy}</label>
                <input type="range" min="0" max="10" value="${dayData.energy}" onchange="updateDailyRange('energy', this.value)">
            </div>
            <div class="input-group">
                <label>Sono (0-10): ${dayData.sleep}</label>
                <input type="range" min="0" max="10" value="${dayData.sleep}" onchange="updateDailyRange('sleep', this.value)">
            </div>
        `;
    }

    else if (currentTab === 'walks') {
        let walksHtml = state.walks.map((w, i) => `
            <div class="walk-item">
                <div style="display: flex; justify-content: space-between;">
                    <strong>${w.date}</strong>
                    <button onclick="deleteWalk(${i})" style="background:none; border:none; color:#ef4444;">Excluir</button>
                </div>
                <p style="font-size: 0.9rem; color: var(--primary)">${w.dist}km em ${w.time}min (${w.speed}km/h)</p>
            </div>
        `).join('');

        content.innerHTML = `
            <div class="card">
                <h3>Nova Caminhada</h3>
                <input type="date" id="w-date" style="margin-bottom: 10px;">
                <input type="number" id="w-dist" placeholder="Distância (km)" style="margin-bottom: 10px;">
                <input type="number" id="w-time" placeholder="Tempo (min)" style="margin-bottom: 10px;">
                <button class="btn-primary" onclick="addWalk()">Adicionar</button>
            </div>
            ${walksHtml}
        `;
    }

    else if (currentTab === 'final') {
        content.innerHTML = `
            <div class="card">
                <h2>Resultados Finais</h2>
                <div class="input-group"><label>Peso Final</label><input type="number" value="${state.final.weight}" onchange="state.final.weight=this.value;save()"></div>
                <div class="input-group"><label>Circunferência Final</label><input type="number" value="${state.final.waist}" onchange="state.final.waist=this.value;save()"></div>
                <div class="input-group"><label>Pressão Final</label><input type="text" value="${state.final.pressure}" onchange="state.final.pressure=this.value;save()"></div>
            </div>
            <div class="card" style="border-color: var(--primary)">
                <h3>Resumo Semanal (Pressão)</h3>
                <input placeholder="Semana 1" value="${state.weeklyBP.w1}" onchange="state.weeklyBP.w1=this.value;save()" style="margin-bottom:5px;">
                <input placeholder="Semana 2" value="${state.weeklyBP.w2}" onchange="state.weeklyBP.w2=this.value;save()" style="margin-bottom:5px;">
                <input placeholder="Semana 3" value="${state.weeklyBP.w3}" onchange="state.weeklyBP.w3=this.value;save()" style="margin-bottom:5px;">
                <input placeholder="Semana 4" value="${state.weeklyBP.w4}" onchange="state.weeklyBP.w4=this.value;save()">
            </div>
        `;
    }
}

function toggleDaily(field) {
    if(!state.daily[selectedDay]) state.daily[selectedDay] = { creatine: false, omega3: false, magnesium: false, nac: false, maca: false, activity: false, energy: 5, sleep: 5 };
    state.daily[selectedDay][field] = !state.daily[selectedDay][field];
    save();
}

function updateDailyRange(field, val) {
    if(!state.daily[selectedDay]) state.daily[selectedDay] = { creatine: false, omega3: false, magnesium: false, nac: false, maca: false, activity: false, energy: 5, sleep: 5 };
    state.daily[selectedDay][field] = parseInt(val);
    save();
}

function addWalk() {
    const d = document.getElementById('w-date').value;
    const dist = document.getElementById('w-dist').value;
    const time = document.getElementById('w-time').value;
    if(!d || !dist || !time) return alert('Preencha tudo');
    const speed = (dist / (time/60)).toFixed(1);
    state.walks.unshift({ date: d, dist, time, speed });
    save();
}

function deleteWalk(i) {
    state.walks.splice(i, 1);
    save();
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}

render();
