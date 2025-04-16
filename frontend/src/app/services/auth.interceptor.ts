import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authToken = localStorage.getItem('authToken');

  if (authToken) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      }
    });
    return next(cloned);
  }

  return next(req);
};
