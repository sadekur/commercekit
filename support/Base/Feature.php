<?php
namespace CommerceKit\Commerce\Support\Base;

use CommerceKit\Commerce\Support\Traits\Hookable;

abstract class Feature {
    use Hookable;
    protected array $settings = [];
}
