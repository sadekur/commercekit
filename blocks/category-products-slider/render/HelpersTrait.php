<?php
trait CslHelpersTrait {

    private function thumb_br(): string {
        $shape  = $this->a['thumbnailShape']  ?? 'square';
        $radius = intval( $this->a['thumbnailRadius'] ?? 0 );
        if ( 'rounded' === $shape ) return '8px';
        if ( 'circle'  === $shape ) return '50%';
        return $radius > 0 ? "{$radius}px" : '0px';
    }

    private function shadow_css(): string {
        if ( empty( $this->a['showBoxShadow'] ) ) return 'none';
        $a = $this->a;
        return intval( $a['boxShadowH']      ?? 0 ) . 'px '
             . intval( $a['boxShadowV']      ?? 4 ) . 'px '
             . intval( $a['boxShadowBlur']   ?? 15 ) . 'px '
             . intval( $a['boxShadowSpread'] ?? 0 ) . 'px '
             . ( $a['boxShadowColor'] ?? 'rgba(0,0,0,0.15)' );
    }

    private function border_css(): string {
        if ( empty( $this->a['showThumbBorder'] ) ) return 'none';
        $a = $this->a;
        return intval( $a['thumbBorderWidth'] ?? 1 ) . 'px '
             . ( $a['thumbBorderStyle'] ?? 'solid' ) . ' '
             . ( $a['thumbBorderColor'] ?? '#dddddd' );
    }

    private function carousel_style(): string {
        if ( ( $this->a['layout'] ?? 'carousel' ) !== 'carousel' ) return 'standard';
        $style = $this->a['carouselStyle'] ?? 'standard';
        return in_array( $style, [ 'ticker', 'fade' ], true ) ? $style : 'standard';
    }

    private function carousel_style_class(): string {
        $style = $this->carousel_style();
        return 'standard' === $style ? '' : ' ck-csl-style-' . $style;
    }

    private function nav_svgs(): array {
        $style = min( 6, max( 1, intval( $this->a['navIconStyle'] ?? 1 ) ) );
        $icons = [
            1 => [
                '<polyline points="15 18 9 12 15 6"/>',
                '<polyline points="9 18 15 12 9 6"/>',
            ],
            2 => [
                '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
                '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
            ],
            3 => [
                '<circle cx="12" cy="12" r="10"/><polyline points="12 8 8 12 12 16"/><line x1="16" y1="12" x2="8" y2="12"/>',
                '<circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/>',
            ],
            4 => [
                '<polyline points="17 4 7 12 17 20"/>',
                '<polyline points="7 4 17 12 7 20"/>',
            ],
            5 => [
                '<polyline points="18 5 11 12 18 19"/><polyline points="12 5 5 12 12 19"/>',
                '<polyline points="6 5 13 12 6 19"/><polyline points="12 5 19 12 12 19"/>',
            ],
            6 => [
                '<rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="14 8 8 12 14 16"/>',
                '<rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="10 8 16 12 10 16"/>',
            ],
        ];
        return $icons[ $style ];
    }
}
