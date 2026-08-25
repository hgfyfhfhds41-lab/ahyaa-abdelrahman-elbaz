from PIL import Image
from pathlib import Path

source = Path('/home/ubuntu/upload/72979.png')
out = Path('/home/ubuntu/ahyaa-abdelrahman-elbaz/assets/images/professor-avatar.png')
image = Image.open(source).convert('RGB')
# The reference avatar sits in the upper hero area of the 864x1821 reference image.
crop = image.crop((492, 145, 735, 355))
crop = crop.resize((512, 512), Image.Resampling.LANCZOS)
crop.save(out, format='PNG', optimize=True)
