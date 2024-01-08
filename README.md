# dot-files
The dotfiles contained within this repository are what is needed to back up and configure my dev environment.

## Steps to bootstrap a new machine
1. Install Apple's Command Line Tools in order to be able to install Git and Homebrew.
```bash
xcode-select --install
```

2. Clone this repo to as hidden directory at called `.dotfiles`. This can be in the `/Desktop` folder for example, but we will will need to create a symlink to the `.gitconfig` and `.zshrc` that is in the Home directory once cloned. See `3)`.
```bash
# Paste whole command
git clone https://github.com/akin-fagbohun/dot-files.git ~/Desktop/.dotfiles
```

3. Create symlinks between the `.gitconfig/.zshrc` in the repo to those in the Home directory.
```bash
# Run this command
ln -s ~/Desktop/.dotfiles/.zshrc ~/.zshrc
ln -s ~/Desktop/.dotfiles/.gitconfig ~/.gitconfig
```

4. Install Homebrew from Safari then run the following command.
```bash
brew bundle --file ~/Desktop/dotfiles/Brewfile

# Alternatively
cd ~/Desktop/.dotfiles && brew bundle
```