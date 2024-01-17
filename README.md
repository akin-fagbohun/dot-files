# dot-files
The dotfiles contained within this repository are what is needed to back up and configure my dev environment.

These are safe operations. If the Command Line presents problems with these, slap a `sudo` in front. 

## Steps to bootstrap a new machine
1. Install Apple's Command Line Tools in order to be able to install Git and Homebrew.
```bash
xcode-select --install
```

2. Clone this repo to as hidden directory at called `.dotfiles`. This can be in the `/Desktop` folder for example, but we will will need to create a symlink to the `.gitconfig` and `.zshrc` that is in the Home directory once cloned. See `3)`.
```bash
# Paste whole command
git clone https://github.com/akin-fagbohun/dot-files.git ~/Documents/Personal/.dotfiles
```

3. Create symlinks between the `.gitconfig/.zshrc` in the repo to those in the Home directory.
```bash
# Run this command to remove the respective file an replace with our own
ln -s ~/Documents/Personal/.dotfiles/.zshrc ~/.zshrc
ln -s ~/Documents/Personal/.dotfiles/.gitconfig ~/.gitconfig
```

4. Install Homebrew from Safari then run the following command.
```bash
brew bundle --file ~/Documents/Personal/dotfiles/Brewfile

# Alternatively
cd ~/Documents/Personal/.dotfiles && brew bundle
```

5. Create symlink for our `.vscode` extensions once it has been installed.
```bash
# Replace the vscode extensions.json with our own.
rm ~/.vscode/extensions/extensions.json && ln -s ~/Documents/Personal/.dotfiles/extensions.json ~/.vscode/extensions
```