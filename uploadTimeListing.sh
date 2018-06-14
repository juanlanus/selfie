find . -newer uploadTime.txt -ls | grep -v git | grep -v swp | grep -v raw
