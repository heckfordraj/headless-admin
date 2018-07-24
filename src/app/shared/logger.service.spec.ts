import { TestBed, async } from '@angular/core/testing';

import { environment } from 'environment';
import { LoggerService } from './logger.service';

let loggerService: LoggerService;
let service: Service;
let _console: ConsoleStub;

describe('LoggerService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [LoggerService]
    }).compileComponents();
  }));

  beforeEach(async(() => createService()));

  it('should create service', () => {
    expect(loggerService).toBeTruthy();
  });

  describe('log', () => {
    it('should be called', () => {
      loggerService.log('');

      expect(service.log).toHaveBeenCalled();
    });

    it('should call console log in dev environment', () => {
      environment.production = false;
      loggerService.log('');

      expect(_console.log).toHaveBeenCalled();
    });

    it('should call console log with val and param args in dev environment', () => {
      environment.production = false;
      loggerService.log('val', 'param');

      expect(_console.log).toHaveBeenCalledWith('val', 'param');
    });

    it('should not call console log in prod environment', () => {
      environment.production = true;
      loggerService.log('');

      expect(_console.log).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should be called', () => {
      loggerService.warn('');

      expect(service.warn).toHaveBeenCalled();
    });

    it('should call console warn', () => {
      loggerService.warn('');

      expect(_console.warn).toHaveBeenCalled();
    });

    it('should call console warn with val and param args', () => {
      loggerService.warn('val', 'param');

      expect(_console.warn).toHaveBeenCalledWith('val', 'param');
    });
  });

  describe('error', () => {
    it('should be called', () => {
      loggerService.error('');

      expect(service.error).toHaveBeenCalled();
    });

    it('should call console error', () => {
      loggerService.error('');

      expect(_console.error).toHaveBeenCalled();
    });

    it('should call console error with val and param args', () => {
      loggerService.error('val', 'param');

      expect(_console.error).toHaveBeenCalledWith('val', 'param');
    });
  });
});

function createService() {
  loggerService = TestBed.get(LoggerService);
  _console = new ConsoleStub();
  service = new Service();
}

class ConsoleStub {
  log: jasmine.Spy;
  warn: jasmine.Spy;
  error: jasmine.Spy;

  constructor() {
    this.log = spyOn(console, 'log').and.callThrough();
    this.warn = spyOn(console, 'warn').and.callThrough();
    this.error = spyOn(console, 'error').and.callThrough();
  }
}

class Service {
  log: jasmine.Spy;
  warn: jasmine.Spy;
  error: jasmine.Spy;

  constructor() {
    this.log = spyOn(loggerService, 'log').and.callThrough();
    this.warn = spyOn(loggerService, 'warn').and.callThrough();
    this.error = spyOn(loggerService, 'error').and.callThrough();
  }
}
