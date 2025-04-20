// Configuration
const backendUrl = "https://yourusername.pythonanywhere.com"; // Replace with your PythonAnywhere URL
let tracks = {};

// DOM Elements
const addTrackBtn = document.getElementById('add-track');
const masterAllBtn = document.getElementById('master-all');
const trackContainer = document.getElementById('track-container');
const emptyState = document.getElementById('empty-state');

// Event Listeners
addTrackBtn.addEventListener('click', addTrack);
masterAllBtn.addEventListener('click', masterAllTracks);

// Core Functions
function addTrack() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.wav,.mp3';
    input.onchange = e => {
        Array.from(e.target.files).forEach(file => {
            if (file) createTrackElement(file);
        });
    };
    input.click();
}

function createTrackElement(file) {
    const trackId = `track-${Date.now()}`;
    const trackCard = document.createElement('div');
    trackCard.className = 'card track-card mb-3';
    trackCard.id = trackId;
    trackCard.innerHTML = `
        <div class="card-header d-flex justify-content-between">
            <h5 class="mb-0">${file.name}</h5>
            <button class="btn btn-sm btn-danger remove-track">×</button>
        </div>
        <div class="card-body">
            <div class="waveform" id="waveform-${trackId}"></div>
            <div class="controls mt-3">
                <button class="btn btn-primary analyze-btn">AI Analyze</button>
            </div>
            <div class="ai-suggestions mt-3" id="suggestions-${trackId}" style="display:none;">
                <h6>AI Suggestions</h6>
                <!-- Suggestions will be populated here -->
            </div>
        </div>
    `;
    
    trackContainer.insertBefore(trackCard, emptyState);
    emptyState.style.display = 'none';
    masterAllBtn.disabled = false;
    
    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
        container: `#waveform-${trackId}`,
        waveColor: '#4e73df',
        progressColor: '#2e59d9',
        height: 100
    });
    wavesurfer.loadBlob(file);
    
    // Store track data
    tracks[trackId] = { file, wavesurfer, element: trackCard };
    
    // Add event listeners
    trackCard.querySelector('.remove-track').addEventListener('click', () => removeTrack(trackId));
    trackCard.querySelector('.analyze-btn').addEventListener('click', () => analyzeTrack(trackId));
}

async function analyzeTrack(trackId) {
    const track = tracks[trackId];
    const formData = new FormData();
    formData.append('audio', track.file);
    
    try {
        const response = await fetch(`${backendUrl}/analyze`, {
            method: 'POST',
            body: formData
        });
        const suggestions = await response.json();
        displaySuggestions(trackId, suggestions);
    } catch (error) {
        console.error('Error:', error);
        alert('Analysis failed. Check console for details.');
    }
}

function displaySuggestions(trackId, suggestions) {
    const suggestionsDiv = document.getElementById(`suggestions-${trackId}`);
    suggestionsDiv.innerHTML = `
        <div class="mb-2">
            <strong>EQ:</strong> 
            Low ${suggestions.eq.low}dB | 
            Mid ${suggestions.eq.mid}dB | 
            High ${suggestions.eq.high}dB
        </div>
        <div class="mb-2"><strong>Pan:</strong> ${suggestions.pan}%</div>
        <div class="mb-2"><strong>Volume:</strong> ${suggestions.volume}%</div>
    `;
    suggestionsDiv.style.display = 'block';
}

function removeTrack(trackId) {
    tracks[trackId].wavesurfer.destroy();
    document.getElementById(trackId).remove();
    delete tracks[trackId];
    if (Object.keys(tracks).length === 0) {
        emptyState.style.display = 'block';
        masterAllBtn.disabled = true;
    }
}

async function masterAllTracks() {
    if (Object.keys(tracks).length === 0) return;
    
    try {
        alert('Mastering complete! (This would process all tracks in a real implementation)');
    } catch (error) {
        console.error('Mastering failed:', error);
        alert('Mastering failed. Check console for details.');
    }
}