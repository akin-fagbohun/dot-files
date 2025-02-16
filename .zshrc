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
alias gpu="git push -u origin"
alias groh="git reset ORIG_HEAD"

# Function
# alias function for "grs" - e.g. "grs 2" === "git reset --soft HEAD~2"
grs() {
    git reset --soft HEAD~"$1"
}

# turn a .mov video into a gif
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