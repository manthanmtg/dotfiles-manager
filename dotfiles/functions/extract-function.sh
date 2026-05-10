# @dotfiles-manager
# name: Universal Extract
# description: A single 'extract' command that detects archive type and decompresses any format (.tar.gz, .zip, .rar, etc.).
# category: functions
# icon: FileArchive
# tags: utility, archives, productivity, automation
# @end

extract() {
  if [ -z "$1" ]; then
    echo "Usage: extract <file>"
    return 1
  fi

  if [ ! -f "$1" ]; then
    echo "Error: '$1' is not a valid file"
    return 1
  fi

  case "$1" in
    *.tar.bz2|*.tbz2) tar xjf "$1" ;;
    *.tar.gz|*.tgz)   tar xzf "$1" ;;
    *.tar.xz)         tar xJf "$1" ;;
    *.tar)            tar xf "$1"  ;;
    *.bz2)            bunzip2 "$1" ;;
    *.rar)
      if command -v unrar >/dev/null 2>&1; then
        unrar x "$1"
      else
        echo "Error: unrar is not installed"
        return 1
      fi
      ;;
    *.gz)             gunzip "$1"  ;;
    *.zip)
      if command -v unzip >/dev/null 2>&1; then
        unzip "$1"
      else
        echo "Error: unzip is not installed"
        return 1
      fi
      ;;
    *.Z)              uncompress "$1" ;;
    *.7z)
      if command -v 7z >/dev/null 2>&1; then
        7z x "$1"
      else
        echo "Error: 7z is not installed"
        return 1
      fi
      ;;
    *)
      echo "Error: '$1' cannot be extracted via extract()"
      return 1
      ;;
  esac
}
