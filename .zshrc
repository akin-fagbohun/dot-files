# Uncomment the following line to enable command auto-correction.
ENABLE_CORRECTION="true"

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git)

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Configure editor
export EDITOR="code --wait"

# ZSH bindings
# Make history searches case-insensitive
setopt HIST_IGNORE_ALL_DUPS

# Bind Up/Down keys to history beginning search
bindkey '^[[A' history-beginning-search-backward  # Up Arrow
bindkey '^[[B' history-beginning-search-forward  # Down Arrow

# Pure Prompt
autoload -U promptinit; promptinit
prompt pure
zstyle :prompt:pure:prompt:success color green # successful input colour
zstyle :prompt:pure:git:stash show yes # turn on git stash status

# ZSH Git Aliases
alias gco="git checkout"
alias gcob="git checkout -b"
alias ga="git add ."
alias gc="git commit"
alias gcm="git commit -m"
alias gp="git push"
alias gpu="git push origin HEAD -u"
alias groh="git reset ORIG_HEAD"

alias nrd="npm run dev" 

# Functions
# Server helpers
# return server running on port: number
port() {
    lsof -i :$1
}

# kill the node server under the supplied port number
killport() {
    PID=$(lsof -i :$1 | grep 'node' | awk '{print $2}')
    if [ -z "$PID" ]; then
        echo "No process found running on port $1."
    else
        kill -9 $PID
        echo "Killed process $PID running on port $1."
    fi
}

# Git helpers
# commit with refactor message
gcmr() {
    git commit -m "refactor: $1"
}

# commit with chore message
gcmc() {
    git commit -m "chore: $1"
}

# commit with feature message
gcmf() {
    git commit -m "feature: $1"
}

# alias function for "grs" - e.g. "grs 2" === "git reset --soft HEAD~2"
grs() {
    git reset --soft HEAD~"$1"
}

# Same as above but will unstage all files that are soft reset
grsu() {
    git reset --soft HEAD~"$1" && git reset
}

# find keyword in git history
gitsearch() {
    git log -S"$1"
}

# turn a .mov video into a gif - requires ffmpeg
makegif() {
    input="$1"
    output="${input%.*}.gif"
    temp_palette="/tmp/palette.png"

    # Step 1: Generate a high-quality color palette with more precise settings
    ffmpeg -i ~/Downloads/"$input" -vf "fps=15,scale=1080:-1:flags=lanczos,palettegen=max_colors=256" -y $temp_palette

    # Step 2: Apply the palette and use dithering with more fine-tuned settings
    ffmpeg -i ~/Downloads/"$input" -i $temp_palette -lavfi "fps=15,scale=1080:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=sierra2_4a" -y ~/Downloads/"$output"

    # Clean up the temporary palette file
    rm $temp_palette
}

# optimise an image for web
optimiseimg() {
    input="$1"
    output="${input%.*}_optimized.jpeg"  # Change extension to .jpg for JPEG output
    quality="75"  # Adjust quality (1-100, lower = smaller file size but lower quality)
    max_width="1800"  # Maximum width for resizing (set to -1 to disable resizing)

    # Optimize the image
    ffmpeg -i ~/Downloads/"$input" \
           -vf "scale=$max_width:-1" \
           -q:v $quality \
           -compression_level 6 \
           ~/Downloads/"$output"

    echo "Optimized image saved as ~/Downloads/$output"
}

# Repair corrupted SOPS file
# essentially, decrypts and re-encrypts sops file when encountering a MAC merge conflict
sopsrepair() {
    # Check if exactly two parameters are passed
    if [ "$#" -ne 2 ]; then
        echo "Error: This function requires exactly two parameters."
        echo "Usage: sopsrepair <encrypted_file.yaml> <gcp-kms-value>"
        return 1
    fi

    # Check if the first parameter ends with '.yaml'
    if [[ "$1" != *.yaml ]]; then
        echo "Error: The first parameter should be a '.yaml' file. The second parameter should be the GCP-KMS value."
        return 1
    fi

    enc_file="$1"
    gcp_kms="$2"

    # Step 1: Decrypt the encrypted file and store its data in a new temporary file
    if ! sops -d --ignore-mac "$enc_file" > temp.gcp.enc.yaml; then
        echo "Error: Failed to decrypt the file '$enc_file'."
        return 1
    fi

    # Step 2: Encrypt the temporary file using the GCP-KMS value
    if ! sops -e --in-place --gcp-kms "$gcp_kms" temp.gcp.enc.yaml; then
        echo "Error: Failed to encrypt the temporary file with GCP-KMS."
        rm -f temp.gcp.enc.yaml  # Clean up the temporary file
        return 1
    fi

    # Step 3: Delete the original conflicted file
    if ! rm "$enc_file"; then
        echo "Error: Failed to delete the original file '$enc_file'."
        rm -f temp.gcp.enc.yaml  # Clean up the temporary file
        return 1
    fi

    # Step 4: Rename the temp file to be the originally conflicted file
    if ! mv temp.gcp.enc.yaml "$enc_file"; then
        echo "Error: Failed to rename the temporary file to '$enc_file'."
        return 1
    fi

    echo "File '$enc_file' successfully repaired."
}

# Zoxide - must be at the end of file
eval "$(zoxide init zsh --cmd cd)"export EDITOR=code --wait

