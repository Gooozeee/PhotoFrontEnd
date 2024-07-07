const scrollToPosition = (yPosition: number) => {
    window.scrollTo({
        top: yPosition,
        behavior: 'smooth',
    });
};

export default scrollToPosition;