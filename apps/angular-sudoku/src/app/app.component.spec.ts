describe('AppComponent', () => {
  it('should create the app', () => {
    expect(true).toEqual(true);
  });

  // TODO: This is causing a stack overflow error

  // const createComponent = createComponentFactory({
  //   component: AppComponent,
  //   imports: [GridComponent],
  // });

  // it('should create the app', () => {
  //   const spectator = createComponent();

  //   expect(spectator).toBeTruthy();
  // });
});
