
# 2️⃣ Install espeak, used for English OOD fallback and some non-English languages
# !apt-get -qq -y install espeak-ng > /dev/null 2>&1

# 3️⃣ Initalize a pipeline
from kokoro import KPipeline
import soundfile as sf
import torch
import sys
import os

# 🇺🇸 'a' => American English, 🇬🇧 'b' => British English
# 🇪🇸 'e' => Spanish es
# 🇫🇷 'f' => French fr-fr
# 🇮🇳 'h' => Hindi hi
# 🇮🇹 'i' => Italian it
# 🇯🇵 'j' => Japanese: pip install misaki[ja]
# 🇧🇷 'p' => Brazilian Portuguese pt-br
# 🇨🇳 'z' => Mandarin Chinese: pip install misaki[zh]

def generate_tts(text, lang_code='a', voice='af_heart', output_file='output.wav'):
    pipeline = KPipeline(lang_code=lang_code) 

    # 4️⃣ Generate, display, and save audio files in a loop.
    generator = pipeline(
        text, voice=voice, 
        speed=1, split_pattern=r'\n+'
    )

    all_audio = []
    
    print(f"Generating audio for: {text[:50]}...")
    
    for i, (gs, ps, audio) in enumerate(generator):
        print(i)  # i => index
        print(gs) # gs => graphemes/text
        print(ps) # ps => phonemes
        all_audio.append(audio)

    # Concatenate all audio segments if needed, or save the first one
    # For simplicity, we'll save the pieces or just the last one/concatenated
    # This example just saves the last chunk if multiple, purely for demonstration
    # In a real app we'd concatenate
    
    if all_audio:
        # Saving just the last chunk as example from the snippet
        # Ideally you'd numpy.concatenate(all_audio) if it's a list of numpy arrays
        import numpy as np
        final_audio = np.concatenate(all_audio)
        sf.write(output_file, final_audio, 24000)
        print(f"Saved to {output_file}")

if __name__ == "__main__":
    # Example usage
    sample_text = '''
    [Kokoro](/kˈOkəɹO/) is an open-weight TTS model with 82 million parameters. 
    Despite its lightweight architecture, it delivers comparable quality to larger models.
    '''
    generate_tts(sample_text)
