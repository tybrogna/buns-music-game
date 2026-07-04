import { render } from 'preact'
import { useState, useEffect, useCallback } from 'preact/hooks';

function MusicTest() {
    const [song, setSong] = useState('./games/test-game/songs/schala.mp3#t=00:00:05')

    return (
        <div>
            hello
            <input type='button' value='do it' onClick={e => setSong('./games/test-game/songs/uldah.mp3#t=00:00:05')} />
            <audio src={song} controls/>
        </div>
    )
}

export default function() {
    render(MusicTest(), document.body)
}